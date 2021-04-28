const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var firstSearch = true;
window.__gcse = {
    searchCallbacks: {
      web: {
        starting: setSearchQuery,
        ready: showSearchResultsModal,
        rendered: getDateFromLink,
      },
    },
  };

function setSearchQuery(gname, query) {
    document.getElementsByClassName("searchresults-modal-title")[0].innerHTML= "Showing results for: <b>" + query + "</b>";
}

function showSearchResultsModal() {
    var searchResultsModal = document.getElementsByClassName('searchresults-modal')[0];
    var body = document.getElementsByTagName('body')[0]
    if(searchResultsModal.style.display == "block")
        return;
    
    moveSearchBarToModal();
    body.style.overflow = 'hidden';
    searchResultsModal.style.display = "block";
}

function closeSearchResultsModal() {
    var searchResultsModal = document.getElementsByClassName('searchresults-modal')[0];
    var body = document.getElementsByTagName('body')[0]

    moveSearchBarToHeader();
    body.style.overflow = 'auto';
    searchResultsModal.style.display = "none";
}

function moveSearchBarToModal(){
    var searchbox =  document.getElementById('___gcse_0');
    document.getElementsByClassName("searchbox-row")[0].appendChild(searchbox);
}

function moveSearchBarToHeader(){
    var searchbox =  document.getElementById('___gcse_0');
    document.getElementsByClassName("wrapper")[0].appendChild(searchbox);
}
/*
    Used to attach date above the post link in google results 
*/
function getDateFromLink()
{
    var searchResults = document.getElementsByClassName("gs-per-result-labels");
    for(let result of searchResults)
    {
        var url = result.getAttribute("url");
        if(!url)
        {
            return;
        }
        
        var dateString = url.substr(location.origin.length + 1, 10);
        var date = new Date(dateString);
        var webResult = result.parentElement.parentElement.parentElement;
        var dateElement = document.createElement("div");
        dateElement.className = "google-result-meta";
        dateElement.innerHTML = MONTHS[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
        webResult.prepend(dateElement);
    }
}
  
function addSearchRowElementInModal() {
    var searchResultsMeta = document.getElementsByClassName("searchresults-modal-body")[0];
    var searchboxRowElement = document.createElement("div");
    searchboxRowElement.className = "searchbox-row";
    searchResultsMeta.prepend(searchboxRowElement);
}