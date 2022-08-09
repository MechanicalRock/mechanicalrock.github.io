const MONTHS = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
window.__gcse = {
    searchCallbacks: {
        web: {
            starting: startSearch,
            ready: searchReady,
            rendered: getDateFromLink,
        },
    },
};

function startLoadingSpinner() {
    var loadingSpinner = document.getElementsByClassName( "loading-spinner-container" )[ 0 ];
    loadingSpinner.style.display = "flex";
}

function setSearchQuery( gname, query ) {
    document.getElementsByClassName( "searchresults-modal-title" )[ 0 ].innerHTML = "Showing results for: <b>" + query + "</b>";
}

function stopLoadingSpinner() {
    var loadingSpinner = document.getElementsByClassName( "loading-spinner-container" )[ 0 ];
    loadingSpinner.style.display = "none";
}

function startSearch( gname, query ) {
    startLoadingSpinner();
    setSearchQuery( gname, query );
}

function searchReady() {
    stopLoadingSpinner();
    showSearchResultsModal();
}

function showSearchResultsModal() {
    var searchResultsModal = document.getElementsByClassName( 'searchresults-modal' )[ 0 ];
    var body = document.getElementsByTagName( 'body' )[ 0 ]
    if ( searchResultsModal.style.display == "block" )
        return;

    moveSearchBarToModal();
    body.style.overflow = 'hidden';
    searchResultsModal.style.display = "block";
}

function closeSearchResultsModal() {
    var searchResultsModal = document.getElementsByClassName( 'searchresults-modal' )[ 0 ];
    var body = document.getElementsByTagName( 'body' )[ 0 ]

    moveSearchBarToHeader();
    body.style.overflow = 'auto';
    searchResultsModal.style.display = "none";
}

function moveSearchBarToModal() {
    var searchbox = document.getElementById( '___gcse_0' );
    document.getElementsByClassName( "searchbox-row" )[ 0 ].appendChild( searchbox );
}

function moveSearchBarToHeader() {
    var searchbox = document.getElementById( '___gcse_0' );
    document.getElementById( "searchbox-placeholder" ).appendChild( searchbox );
}
/*
    Used to attach date above the post link in google results
*/
function getDateFromLink() {
    var webResults = document.getElementsByClassName( "gs-webResult gs-result" );
    for ( let webResult of webResults ) {
        var result = webResult.getElementsByClassName( "gs-per-result-labels" )[ 0 ];
        var url = result.getAttribute( "url" );
        if ( !url ) {
            return;
        }

        var dateString = url.substring( location.origin.length + 1, 10 );
        var date = new Date( dateString );
        var dateElement = document.createElement( "div" );
        dateElement.className = "google-result-meta";
        dateElement.innerHTML = MONTHS[ date.getMonth() ] + " " + date.getDate() + ", " + date.getFullYear();
        webResult.prepend( dateElement );
    }
}

module.exports = {
    getDateFromLink,
    moveSearchBarToHeader,
    moveSearchBarToModal,
    closeSearchResultsModal,
    showSearchResultsModal,
    setSearchQuery
}
