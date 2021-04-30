function setupPagination(visiblePageNumbers) 
{
    var currentPageNumber = getCurrentPageNumber();
    var offsetPages = Math.floor((currentPageNumber - 1)/visiblePageNumbers) * visiblePageNumbers;
    var startingPageNumber = offsetPages + 1
    var listElements = [];
    if(currentPageNumber > visiblePageNumbers)
    {
        var previousSetOfPagesStartPage = startingPageNumber - visiblePageNumbers
        var previousSetOfPagesElement = getSetOfPagesElement(previousSetOfPagesStartPage, "<<"); 
        listElements = [...listElements, previousSetOfPagesElement]
    }

    for (pageNumber = startingPageNumber; pageNumber <= totalPages && pageNumber < startingPageNumber + visiblePageNumbers ; pageNumber ++)
    {
        listElement = setupPageButton(pageNumber, pageNumber == currentPageNumber)
        listElements = [...listElements, listElement]
    }

    if(currentPageNumber < totalPages)
    {
        var nextSetOfPagesStartPage = startingPageNumber + visiblePageNumbers;
        var nextSetOfPagesElement = getSetOfPagesElement(nextSetOfPagesStartPage, ">>"); 
        listElements = [...listElements, nextSetOfPagesElement]
    }

    var paginationListElement = document.getElementsByClassName("pagination")[0];
    listElements.forEach(element => {
        paginationListElement.appendChild(element);
    });
}

function getCurrentPageNumber()
{
    var pathName = window.location.pathname;
    pathName = pathName.substring(0, pathName.length - 1)
    var currentPageNumber = pathName == "" ? "1" : pathName.split("/").pop();
    currentPageNumber = currentPageNumber > totalPages ? "1" : currentPageNumber;

    return currentPageNumber;
}

function getSetOfPagesElement(startOfPageNumbers, label)
{
    var setOfPagesElement = document.createElement("a");
    setOfPagesElement.innerText = label;
    setHrefForPage(setOfPagesElement, startOfPageNumbers)
    setOfPagesElement.setAttribute("onclick", "setupPagination()");
    setOfPagesElement.className = "change-pages-set";
    var listElement = document.createElement("li");
    listElement.appendChild(setOfPagesElement);

    return listElement;
}

function setupPageButton(pageNumber, isActive)
{
    var pageNumberElement = document.createElement("a");
    pageNumberElement.innerText = pageNumber;
    setHrefForPage(pageNumberElement, pageNumber)

    pageNumberElement.className = isActive ? "page active" : "page";
    var listElement = document.createElement("li");
    listElement.appendChild(pageNumberElement);

    return listElement;
}

function setHrefForPage(element, pageNumber)
{
    if(pageNumber == 1)
    {
        element.setAttribute("href", "/");
    }
    else
    {
        element.setAttribute("href", paginatePath + pageNumber );
    }
}

module.exports = {
    setHrefForPage,
    setupPageButton,
    getSetOfPagesElement,
    getCurrentPageNumber,
    setupPagination
}