---
layout: post
font: serif
title: "NextJS Client Side Render (CSR) vs Server Side Render (SSR)"
description: "A benchmark on NextJS data strategies and what their overall UX impacts are."
date: 2022-12-01
highlight: monokai
author: Quintin Maseyk
tags: [nextjs, react, ssr, csr, ssg]
---

## Background

After using NextJS for a short while now I've always wondered which strategy for fetching data was more superior than the other. Since ajax was introduced we've been firmiliar with circular loading spinners, dot-dot-dot animations, crazy logo transitions etc, all in place to distract the user while the application requests more data to present.

Server Side Rendering (SSR) has been a round for a few years now and it was always a chore to maintain the relationship between a page and server-content, but as technology advances frameworks such as NextJS makes this capability much easier to use. In NextJS's case these strategies are colocated in the Page source code.

Here are the current set of content strategies:

1. [Static]: Pages are automatically rendered as static HTML during build (uses no initial props)
2. [Static with Client Side Fetch/Render (CSR)]: As per "Static" with the addition of React fetching data on mounting components
3. [Server Side Generated (SSG)]: Pages are automatically generated as static HTML + JSON during build (uses getStaticProps)
4. [Incremental Static Regeneration (ISR)]: As per "SSG", however managed by the middleware layer and only during invokation
5. [Server Side Render (SSR)]: renders the request page at runtime, everytime (uses getInitialProps or getServerSideProps)

As you can see there are a lot of ways you can configure how parts of your website get managed; the point of this blog is to bench mark a few of the strategies against each other from both network and user experience perspectives.

> :warning: **NOTE**
>
> NextJS do a great job in detailing when/why you should use strategies. The following benchmarks go against their recommendations for the simple fact of comparing performance stats.

:bulb:
At Mechanical Rock we believe running well-defined experiements will help us grow in the right direction as it enables us to better frame problem statements. We'll exercise this as we go to see if our hypotheses line up.

## Experiement 1

```SSR pages are more performant than CSR pages```

My theory is it'll be faster for a server to manage the back-end requests as it'll save the client from:

* making a new request from the browser to API layer and all the baggage which comes with that
* the API layer is closer to the downstream source(s) than the client are, thus making it faster to relay the data


## Experiement 2

```Skeleton loading indicators are better for UX than circular loaders```

It's most common for pages to be built with many components and for some of those components to be injected with dynamic data contextualised for the end-user. In these cases developers tend to apply "circular progressive loading indicators" to let the user know the area of the screen is fetching data. The problem with this implementation is the indicator doesn't express well enough on how the data will be populated and presented in the UI once it has finished loading the data. This will likely cause a [Cumulative Layout Shift](https://web.dev/optimize-cls/) (CLS)

Have you ever been to a site on either desktop/mobile phone, got presented some content, found a link to click on but just as you did the link jumped away from you? This is occuring more often than none and the experience is frustrating!

This is why perormance tools like [Lighthouse](https://web.dev/performance-scoring/) are increasing their weight of CLS more and more.


## Experiement 3

```Skeleton loading indicators are better for UX than circular loaders```


## Conclusion

Given you can only apply `getServerSideProps()` at a page level it's less ideal to add it to a complex application as you will likely be preloading too much unneccessary data for the first impression.

If your page needs to be indexable by search crawlers it doesn't make sense to use `getServerSideProps()` as that suggests the data, thus content is dynamic. Instead, find the static content for the page which really matters and use CSR for the other dynamic components after page load so at least the crawlers has enough information to cache.




```tsx
function WholePage() {
  const [openMenu, setOpenMenu] = React.useState(false);

  return (
    <>
      <header>
        <AppBar>
          <Toolbar>
            <IconButton
              aria-label="menu"
              onClick={() => setOpenMenu(state => !state)}
            >
              <MenuIcon />
            </IconButton>
            Component Library
          </Toolbar>
        </AppBar>
        <nav aria-label="main menu navigation">
          <Drawer
            anchor="left"
            disablePortal
            onClose={() => setOpenMenu(false)}
            open={openMenu}
            variant="temporary"
          >
            <MenuItems setOpenMenu={setOpenMenu} />
          </Drawer>
        </nav>
      </header>
      <main>
        <h1>Component Library</h1>
        ...lots of components with state changes
      </main>
    </>
  )
}
```

---

Don't be shy, [get in touch with us!](https://www.mechanicalrock.io/lets-get-started)

![Mechanical Rock Logo](/img/mr-logo-dark-landscape.jpg)
