---
layout: post
font: serif
title: "FED Talk! Episode 3: Setting Up Routing in React"
description: "In today’s episode we will setup routing in our React app, the pro way!"
date: 2021-06-09
highlight: monokai
image: /img/fed-talk/s01e03/cover-ep3-740.png
author: Quintin Maseyk
tags: [material ui, react, setting up routing in react, react router]
---

![Front-End Development Talk: Episode 3 - Setting up Routing in React](/img/fed-talk/s01e03/cover-ep3-740.png)

In today's episode we will step through how to implement your applications routing using [**React Router**](https://reactrouter.com/web/guides/quick-start), configuring everything from:
*

**Let's get started!**

---

**Table of Contents:**

---

## :thinking: What's a Route?

From the get-go React Apps are configured as a **Single Page Application** (SPA).
This means when you build your App everything is shelled into your projects root `index.html` file made available in the `public` folder. If you create anchor tag links expecting your users to be navigated to another landing URL, it simply will not work as the only `.html` page exported from the build at this stage is the root file.
This is where the recommended library **React Router** comes into play.

A route is an implementation where we bind the URL into our React App and as React developers we the power to configure routes in a meaningful way.
For example we can configure:
* our home page: `/`,
* nested child pages: `/product-category/products`,
* contextual information: `/product-category/products/ABC` -> `/product-category/products/:productId` -> console.log(productId) // "ABC",
* redirects,
* fallbacks to things like a "Page not found" page.

---

## Setting Up Routing in React

Before we start implementing we should spend some time upfront to design what our Routes will look like.
The following questions help me during this phase:


**Will your App be publicly available and are you expecting Google (or any other engine) to index your pages?**
The following topics are worth a read:
* [Information Architecture](https://www.toptal.com/designers/ia/guide-to-information-architecture)
* [Why sitemaps matter](https://www.semrush.com/blog/xml-sitemap/)

**Will users copy/pasting URLs to deep link into your content?**

**Will users bookmark URLs for future use?**

For the rest of our journey we will build out our App answering these two questions and with best practices in mind.

Let's check the current state of our App to see how we can design our Information Architecture.
![Screenshot of the current state of our App](/img/fed-talk/s01e03/component-library-screenshot.png){:width="350"}

There are clearly 3 areas which can be broken down into smaller digestible bits of content: Typographies, Colour Palette, Buttons. Off the bat we can declare 3 routes:

* `/typographies`
* `/colour-palette`
* `/buttons`

Take some time to imagine how your App will evolve... I foresee it containing a mixture of information:

* Getting Started: `/`
* UI: `/ui/*`
* Components: `/components/*`
* Feedback: `/feedback`
* Not found

So, because of this we should change our routes to be:

* `/ui/typographies`
* `/ui/colour-palette`
* `/ui/buttons`

Now that we have a clear idea on our implementation, lets install the `react-router-dom` library to get started:

```bash
npm install react-router-dom
npm install --save-dev @types/react-router-dom
```

---

## Configuring Routes

It's best to setup Routes at the highest logical level in your App so all the `Router` contextual information can neatly propagate down to your actual components.

Update your App code with the following:

```tsx
// src/App.tsx

import { BrowserRouter } from "react-router-dom";

import { CssBaseline, ThemeProvider } from "@material-ui/core";

import AppBar from "./components/AppBar";
import BodyContent from "./components/BodyContent";
import Routes from "./Routes";
import Theme from "./theme";

export default function App() {
  return (
    <ThemeProvider theme={Theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppBar />
        <BodyContent>
          <Routes />
        </BodyContent>
      </BrowserRouter>
    </ThemeProvider>
  );
}
```
**Note** how the `BrowserRouter` component now wraps the content.

Update your BodyContent code with the following:

```tsx
// src/components/BodyContent/index.tsx

import React from "react";

import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles(() => ({
  root: {
    margin: '0 auto',
    maxWidth: '57rem',
    padding: '2rem 0'
  }
}))

export default function BodyContent({ children }: { children: React.ReactNode }) {
  const classes = useStyles();

  return (
    <main className={classes.root}>
      {children}
    </main>
  )
}
```
**Note** how we've replaced the manually imported UI components with React's Children prop; this is where our new Router will pass in the Component per the Browser URL route.

Lastly we've got to create our Routes file:

```tsx
// src/Routes.tsx

import React from "react";
import { Route, Switch } from "react-router-dom";

import Buttons from "./ui/Buttons";
import ColourPalette from "./ui/ColourPalette";
import Typographies from "./ui/Typographies";

export default function Routes() {
  return (
    <Switch>
      <Route path="/ui/buttons" component={Buttons} />
      <Route path="/ui/colour-palette" component={ColourPalette} />
      <Route path="/ui/typographies" component={Typographies} />
    </Switch>
  );
}
```
**Note** the use of `Route` and `Switch`.

**React Router: Route**

> The Route component is perhaps the most important component in React Router to understand and learn to use well. Its most basic responsibility is to render some UI when its path matches the current URL.
>
> [Learn more](https://reactrouter.com/web/api/Route)


**React Router: Switch**

> Renders the first child `<Route>` or `<Redirect>` that matches the location.
> **How is this different than just using a bunch of `<Route>`s?**
> `<Switch>` is unique in that it renders a route exclusively. In contrast, every `<Route>` that matches the location renders inclusively.
>
> [Learn more](https://reactrouter.com/web/api/Switch)

Let's take a look at what our Buttons page looks like, by typing in the URL: "http://localhost:3000/buttons"

![Screenshot of the Buttons route](/img/fed-talk/s01e03/buttons-route.png){:width="350"}

:heart:
**That's pretty cool, we've now just split out the content for our App!**

## Linking between pages

Now that our base routes have been setup, let's configure the Links in our left menu to allow users to navigate between the content.

```tsx
// src/components/MainMenu/index.tsx

import React from "react";
import { useHistory } from "react-router";

import { Drawer, List, ListItem, ListItemText } from "@material-ui/core";

const menuItems = [
  { label: 'Buttons', url: '/ui/buttons' },
  { label: 'Colour Palette', url: '/ui/colour-palette' },
  { label: 'Typogaphies', url: '/ui/typographies' },
]

function MenuItems({ setOpenMenu }: { setOpenMenu: React.Dispatch<React.SetStateAction<boolean>> }) {
  const { push } = useHistory();

  const onLinkNavigation = (url: string) => {
    push(url);
    setOpenMenu(false);
  }

  return (
    <List>
      {menuItems.map(({ label, url }) => (
        <ListItem button key={label} onClick={() => onLinkNavigation(url)}>
          <ListItemText primary={label} />
        </ListItem>
      ))}
    </List>
  )
}

/* ...Remainder of code */
```

**Notes:**
* We moved the `menuItems` outside the component, this is simply to initialize the menuItems once and refer to it there after.
* We declare the use of the `History` hook and explicitly require its `push` function for future use.
* We then created a function `onLinkNavigation` to manage the users click event. Upon clicking we instruct the App to push the new navigation URL into the browsers History queue; then we hide the menu.

Here's what this new change looks like:

![Screen captured gif illustrating a user navigating through the 3 UI pages via the left menu links](/img/fed-talk/s01e03/left-nav-animation.gif){:width="350"}

:warning:
**Hang on, this implementation has flaws!**

Even though this functionally works, it's unfortunately not accessible!
MUI Have realized this is a problem and have provided a way for us to integrate 3rd party components such as `react-router-dom` `Link` component; which would ultimately render our `ListItem` component as an anchor tag, with a href value.

Let's make the changes:

```tsx
// src/components/MainMenu/index.tsx

import React from "react";
import { Link } from "react-router-dom";

import { Drawer, List, ListItem, ListItemText } from "@material-ui/core";

const menuItems = [
  { label: 'Buttons', url: '/ui/buttons' },
  { label: 'Colour Palette', url: '/ui/colour-palette' },
  { label: 'Typogaphies', url: '/ui/typographies' },
]

function MenuItems({ setOpenMenu }: { setOpenMenu: React.Dispatch<React.SetStateAction<boolean>> }) {
  return (
    <List>
      {menuItems.map(({ label, url }) => (
        <ListItem
          button
          component={Link}
          key={label}
          onClick={() => setOpenMenu(false)}
          to={url}
        >
          <ListItemText primary={label} />
        </ListItem>
      ))}
    </List>
  )
}

/* ...Remainder of code */
```

**Notes:**
* We've imported the `Link` component from `react-router-dom` and then passed it through to the `ListItem` "component" property. This then extends the TypeScript definition of `ListItem` with the types of `Link`, making the "to" property available.
* We then removed the need to include the `History` hooks as we've passed the menuItem's url value into the "to" property.
* We update the "onClick" property to collapse the main menu there after.

:champagne:
Those links are now fully accessible!

---

<!-- ## :pray: Closing

At this stage your application should be wrapped with a Theme Provider.
You should have enough knowledge on how to override the styles of MUI components as well as how to create your own styles along side your own components.

You are now ready to move onto the next episode where I’ll be walking you through how to implement Routing in your app, covering the following topics:

* How to setup Routing in your app,
* Routes with parameters,
* Route hooks,
* Route transitions


[Previous Episode:<br/><strong>Getting Started with React & Material UI</strong>](/2021/04/27/fed-talk-s01e01-getting-started){: .btn.chevron.chevronLeft}

---

Don't be shy, [get in touch with us!](https://www.mechanicalrock.io/lets-get-started)

![Mechanical Rock Logo](/img/mr-logo-dark-landscape.jpg)
 -->
