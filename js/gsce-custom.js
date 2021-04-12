const DOMAIN_URL_LENGTH = "https://mechanicalrock.github.io/".length;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const VISIBLE_PAGE_NUMBERS = 10;
window.__gcse = {
    searchCallbacks: {
      web: {
        rendered: hidePosts,
      },
    },
  };
var homePagePostsElement;

window.onload = function() {
   var clearButtonExists = setInterval(() => {
        var clearButtonElements = document.getElementsByClassName("gsst_a");
        if(clearButtonElements.length > 0)
        {
            clearButtonElements[0].addEventListener("click", showPosts);
            clearInterval(clearButtonExists);  
        }
    }, 100);

    var homePagePostsElements = document.getElementsByClassName("home-page-posts");
    if(homePagePostsElements.length == 0)
    {
        console.error("Home page posts element not found.");
        return;
    }
    homePagePostsElement = homePagePostsElements[0];

    setupPagination();
}

function hidePosts()
{
    var resultsElements = document.getElementsByClassName("gsc-results-wrapper-nooverlay");
    if(resultsElements.length == 0)
    {
        console.error("Results element not found.");
        return;
    }

    var resultsElement =  resultsElements[0]
    resultsElement.style.display = "block";
    homePagePostsElement.style.display = "none";

    getDateFromLink();
}

function showPosts()
{
    var resultsElements = document.getElementsByClassName("gsc-results-wrapper-nooverlay");
    if(resultsElements.length == 0)
    {
        console.error("Results element not found.");
        return;
    }

    var resultsElement =  resultsElements[0];
    resultsElement.style.display = "none";
    homePagePostsElement.style.display = "block";
}

/*
    Used to attach date above the post link in google results 
*/
function getDateFromLink()
{
    var linksExist = setInterval(() => {
        var links = document.getElementsByClassName("gs-per-result-labels");
        links = [...links]
        if(links.length > 0)
        {
            
            links.forEach(link => {
                var url = link.getAttribute("url");
                if(!url)
                {
                    return;
                }
                
                var dateString = url.substr(DOMAIN_URL_LENGTH, 10);
                var date = new Date(dateString);
                var webResult = link.parentElement.parentElement.parentElement;
                var dateElement = document.createElement("div");
                dateElement.className = "google-result-meta";
                dateElement.innerHTML = MONTHS[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
                webResult.prepend(dateElement);
            });

            clearInterval(linksExist);
        }
    }, 100);
}
  
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