const { expect, test } = require("@jest/globals");
const sut = require("../gcse-custom");

beforeEach(() => {
    document.body.outerHTML = `
        <div class="searchresults-modal-body"></div>
    `;
})

test('appends date to Google result', () => {
    Object.defineProperty(window, 'location', {
        value: {
        origin: "testdomain.com/"
        }
    });
    document.body.innerHTML = `
        <div>
            <div>
                <div>
                    <div class="gs-per-result-labels" url="${location.origin}/2013/2/1"></div>
                </div>
            </div>
        </div>
        <div>
            <div>
                <div>
                    <div class="gs-per-result-labels" url="${location.origin}/2016/11/25"></div>
                </div>
            </div>
        </div>`;

    sut.getDateFromLink()

    var expected = `
        <div><div class="google-result-meta">Feb 1, 2013</div>
            <div>
                <div>
                    <div class="gs-per-result-labels" url="${location.origin}/2013/2/1"></div>
                </div>
            </div>
        </div>
        <div><div class="google-result-meta">Nov 25, 2016</div>
            <div>
                <div>
                    <div class="gs-per-result-labels" url="${location.origin}/2016/11/25"></div>
                </div>
            </div>
        </div>`;

    expect(document.body.innerHTML).toEqual(expected);
})

test('move search bar to header', () => {
    document.body.innerHTML =  `
        <div id="___gcse_0"></div>
        <div class="wrapper"></div>
    `

    sut.moveSearchBarToHeader()

    var expected =  `<div class="wrapper"><div id="___gcse_0"></div></div>`
    expect(document.body.innerHTML.trim()).toEqual(expected.trim());
})

test('move search bar to modal', () => {
    document.body.innerHTML =  `
        <div id="___gcse_0"></div>
        <div class="searchbox-row"></div>
    `

    sut.moveSearchBarToModal()

    var expected =  `<div class="searchbox-row"><div id="___gcse_0"></div></div>`
    expect(document.body.innerHTML.trim()).toEqual(expected.trim());
})

test('close search results modal', () => {
    document.body.outerHTML =  `
    <div class="searchresults-modal"></div>
    <div class="searchbox-row">
        <div id="___gcse_0"></div>
    </div>
    <div class="wrapper"></div>
    <body>
    </body>
`
    sut.closeSearchResultsModal();

    var expected = `<body style="overflow: auto;"><div class="searchresults-modal" style="display: none;"></div>
    <div class="searchbox-row">
        
    </div>
    <div class="wrapper"><div id="___gcse_0"></div></div>
    
    
</body>
    `

    expect(document.body.outerHTML.trim()).toEqual(expected.trim());
})

test('show search results modal', () => {
    document.body.outerHTML =  `
    <body style="overflow: auto;">
        <div class="searchresults-modal" style="display: none;"></div>
        <div class="searchbox-row"></div>
        <div class="wrapper">
            <div id="___gcse_0"></div>
        </div>
    </body>`
    sut.showSearchResultsModal();

    var expected = `
    <body style="overflow: hidden;">
        <div class="searchresults-modal" style="display: block;"></div>
        <div class="searchbox-row"><div id="___gcse_0"></div></div>
        <div class="wrapper">
            
        </div>
    </body>`

    expect(document.body.outerHTML.trim()).toEqual(expected.trim());
})

test('set search query title', () => {
    var queryString = "test search";
    document.body.innerHTML = `
        <div class="searchresults-modal-title"></div>
    `
    sut.setSearchQuery('search-box', queryString);

    var expected = `
    <div class="searchresults-modal-title">Showing results for: <b>${queryString}</b></div>
    `
    expect(document.body.innerHTML.trim()).toEqual(expected.trim());
})