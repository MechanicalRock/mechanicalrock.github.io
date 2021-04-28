const VISIBLE_PAGE_NUMBERS = 10;

function setupPagination() 
{
    var currentPageNumber = getCurrentPageNumber();
    var offsetPages = Math.floor((currentPageNumber - 1)/VISIBLE_PAGE_NUMBERS) * VISIBLE_PAGE_NUMBERS;
    var startingPageNumber = offsetPages + 1
    var listElements = [];
    if(currentPageNumber > VISIBLE_PAGE_NUMBERS)
    {
        var previousSetOfPagesStartPage = startingPageNumber - VISIBLE_PAGE_NUMBERS
        var previousSetOfPagesElement = getSetOfPagesElement(previousSetOfPagesStartPage, "<<"); 
        listElements = [...listElements, previousSetOfPagesElement]
    }

    for (pageNumber = startingPageNumber; pageNumber <= totalPages && pageNumber < startingPageNumber + VISIBLE_PAGE_NUMBERS ; pageNumber ++)
    {
        listElement = setupPageButton(pageNumber, pageNumber == currentPageNumber)
        listElements = [...listElements, listElement]
    }

    if(currentPageNumber < totalPages)
    {
        var nextSetOfPagesStartPage = startingPageNumber + VISIBLE_PAGE_NUMBERS;
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
    var currentPageNumber = pathName == "" ? 1 : pathName.split("/").pop();
    currentPageNumber = currentPageNumber > totalPages ? 1 : currentPageNumber;

    return currentPageNumber;
}

function getSetOfPagesElement(startOfPageNumbers, label)
{
    var setOfPagesElement = document.createElement("a");
    setOfPagesElement.innerText = label;
    if(startOfPageNumbers == 1)
    {
        setOfPagesElement.setAttribute("href", "/");
    }
    else
    {
        setOfPagesElement.setAttribute("href", paginatePath + startOfPageNumbers);
    }
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
    if(pageNumber == 1)
    {
        pageNumberElement.setAttribute("href", "/");
    }
    else
    {
        pageNumberElement.setAttribute("href", paginatePath + pageNumber );
    }

    pageNumberElement.className = isActive ? "page active" : "page";
    var listElement = document.createElement("li");
    listElement.appendChild(pageNumberElement);

    return listElement;
}
