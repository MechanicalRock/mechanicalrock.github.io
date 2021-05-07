const { expect } = require("@jest/globals");
const sut = require("../paginate");

beforeEach(() => {
    window.paginatePath = "path/"
    window.totalPages = 11;
    Object.defineProperty(window, 'location', {
        value: {
        pathname: "testpath/1/"
        }
    });
    document.body.innerHTML = `
        <ul class="pagination"></ul>
    `;
})

test('sets href for first page button', () => {
    var actual = document.createElement("div");

    var expected = document.createElement("div");
    expected.setAttribute("href", "/");

    sut.setHrefForPage(actual, 1)

    expect(actual).toEqual(expected);
});

test('sets href for non-first page button', () => {
    var pageNumber = 8;
    var actual = document.createElement("div");

    var expected = document.createElement("div");
    expected.setAttribute("href", window.paginatePath + pageNumber);

    sut.setHrefForPage(actual, pageNumber)

    expect(actual).toEqual(expected);
});

test('creates a new page button for the non-first page', () => {
    var pageNumber = 2
    var attributes = [getMockHrefAttribute(pageNumber)];
    var expected = createMockPageElement(pageNumber, "page", attributes);

    expect(sut.setupPageButton(pageNumber, false)).toEqual(expected);
});

test('creates a new page button for the non-first active page', () => {
    var pageNumber = 7;
    var attributes = [getMockHrefAttribute(pageNumber)];
    var expected = createMockPageElement(pageNumber, "page active", attributes);

    expect(sut.setupPageButton(pageNumber, true)).toEqual(expected);
});

test('creates a new set of pages element', () => {
    var pageNumber = 10;
    var label = ">>";
    var attributes = [
    getMockHrefAttribute(pageNumber),
    {
        name: "onclick",
        value: "setupPagination()"
    }];
    var expected = createMockPageElement(label, "change-pages-set", attributes);

    expect(sut.getSetOfPagesElement(pageNumber, label)).toEqual(expected);
});

test("returns the current page number from the url", () => {
    window.location.pathname = "/testPath/7/";
    expect(sut.getCurrentPageNumber()).toBe("7");
})

test("returns the current page number from the url when page number is greater than the total number of pages", () => {
    window.location.pathname = "/testPath/145/";
    window.totalPages = 10;
    expect(sut.getCurrentPageNumber()).toEqual("1");
})

test("sets up first page pagination", () => {
    var expectedFirstPage = createMockPageElement(1, "page active", [getMockHrefAttribute(1)]);
    var expectedSecondPage = createMockPageElement(2, "page", [getMockHrefAttribute(2)]);
    var expectedThirdPage = createMockPageElement(3, "page", [getMockHrefAttribute(3)]);
    var attributes = [
        getMockHrefAttribute(4),
        {
            name: "onclick",
            value: "setupPagination()"
        }];
    var expectedNextSetOfPages = createMockPageElement(">>", "change-pages-set", attributes);
    var expectedList = [expectedFirstPage, expectedSecondPage, expectedThirdPage, expectedNextSetOfPages]
    var expected = document.createElement("ul");
    expected.className = "pagination";
    expectedList.forEach(element =>
    {
        expected.appendChild(element);
    });
    
    sut.setupPagination(3);

    var actual =  document.getElementsByClassName("pagination")[0] 
    expect(actual).toEqual(expected);
})

test("sets up middle page pagination", () => {
    window.location.pathname = "/testPath/5/";
    var previousSetOfPagesAttributes = [
        getMockHrefAttribute(1),
        {
            name: "onclick",
            value: "setupPagination()"
        }];
    var expectedPreviousSetOfPages = createMockPageElement("<<", "change-pages-set", previousSetOfPagesAttributes);
    var expectedFourthPage = createMockPageElement(4, "page", [getMockHrefAttribute(4)]);
    var expectedFifthPage = createMockPageElement(5, "page active", [getMockHrefAttribute(5)]);
    var expectedSixthPage = createMockPageElement(6, "page", [getMockHrefAttribute(6)]);
    var nextSetOfPagesAttributes = [
        getMockHrefAttribute(7),
        {
            name: "onclick",
            value: "setupPagination()"
        }];
    var expectedNextSetOfPages = createMockPageElement(">>", "change-pages-set", nextSetOfPagesAttributes);
    var expectedList = [expectedPreviousSetOfPages, expectedFourthPage, expectedFifthPage, expectedSixthPage, expectedNextSetOfPages]
    var expected = document.createElement("ul");
    expected.className = "pagination";
    expectedList.forEach(element =>
    {
        expected.appendChild(element);
    });
    
    sut.setupPagination(3);

    var actual =  document.getElementsByClassName("pagination")[0] 
    expect(actual).toEqual(expected);
})

test("sets up end page pagination", () => {
    window.location.pathname = "/testPath/11/";
    var previousSetOfPagesAttributes = [
        getMockHrefAttribute(9),
        {
            name: "onclick",
            value: "setupPagination()"
        }];
    var expectedPreviousSetOfPages = createMockPageElement("<<", "change-pages-set", previousSetOfPagesAttributes);
    var expectedEleventhPage = createMockPageElement(11, "page active", [getMockHrefAttribute(11)]);
    var expectedList = [expectedPreviousSetOfPages, expectedEleventhPage]
    var expected = document.createElement("ul");
    expected.className = "pagination";
    expectedList.forEach(element =>
    {
        expected.appendChild(element);
    });
    
    sut.setupPagination(2);

    var actual =  document.getElementsByClassName("pagination")[0] 
    expect(actual).toEqual(expected);
})

function createMockPageElement(label, className, attributes)
{
    var pageElement = document.createElement("li");
    pageNumberElement =  document.createElement("a");
    pageNumberElement.className = className;
    pageNumberElement.innerText = label;
    for(let attribute of attributes) 
    {
        pageNumberElement.setAttribute(attribute.name, attribute.value);
    }
    pageElement.appendChild(pageNumberElement);

    return pageElement;
}

function getMockHrefAttribute(pageNumber){
    return {
        name: "href",
        value: pageNumber == 1 ? "/" : window.paginatePath + pageNumber,
    }
}