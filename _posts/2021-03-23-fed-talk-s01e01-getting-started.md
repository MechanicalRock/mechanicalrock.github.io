---
layout: post
title: "Adding CodeBuild reports to Cypress e2e tests using CDK"
date: 2021-03-30
tags: front-end-development react material-ui design theme
author: Quintin Maseyk
image: /img/reports.png
---

![Generic reports](/img/reports.png)

# FED Talk! (S01E01): Getting Started

I’ve been meaning to write a blog series for quite some time now. Having worked in many industries, building numerous Web Apps on different stacks and Design Systems, I’m here to share my learnings and hopefully you will get something out of it.

This series will contain multiple episodes, chronologically ordered to equip you with a typical Front-End Developer experience of building React Apps. The series will grow over time, as it stands the following subjects have been identified:

* Episode 1: Getting Started
* Episode 2: Theme Providers
* Episode 3: Routing
* Episode 4: Testing and Developing components

## :thought_balloon: Mindset
**Does what you’re building already have an affiliated Design System (DS), or a living Style Guide, or at least some kind of Branding documentation?**

If the answer is yes, that’s great, you have a basis to work from and extend off. My mentality in this case is

* how can I consume the existing styles with least amount of friction?
* how can I contribute back so others can benefit?

If the answer is no, that’s still okay, instead you have prime opportunity to centralize the App’s DS artifacts! My mentality in this case is a bit more involved and requires team/company wide structure to help formulate a cross functional Design → Developer process. We will cover this in more detail throughout the series.

For the remainder of this series we will assume there is no DS, instead, we will build one DS alongside our functional React App! That's the cool thing about this, when you are creating a new App, it’s better practise to create one from the get-go as it helps with testing, its living documentation, it can make design discussions easier etc.

> :sweat_smile: I’m flinging the word “Design System” too loose here. We’ll be creating a Living Component Library (a subset of a Design System) as trying to build full a Design System is more than just code artifacts.

## :thinking: Which UI Library?

There has and always will be a handful of UI libraries floating around, battling for top adoption rates. What’s important is to understand the basis of each of the UI libraries, in the end of the day they are just that: a library. The onus is on you to determine:

* When was it created?
* What does their future roadmap entail and will they continue to support it?
* What major version is it on?
* How much community support does it have?
* What browsers do they support and does it align with yours?
* How Accessible is the library?
* What is their documentation like?
* Does it align with your tech stack (Typescript? SSR? Testable?)
* Can you contribute back?

### Comparison
I’ve chosen 3 libraries to compare, each slightly different in their philosophies.

*Snapshot taken as of April, 2021.*
|                        | ![Bootstrap Logo](/img/fed-talk/bootstrap.png)<br>**Bootstrap**                    | ![Material-UI Logo](/img/fed-talk/mui.png)<br>**Material UI**                   | ![Tailwind CSS Logo](/img/fed-talk/tailwind.png)<br>**Tailwind CSS** |
|------------------------|--------------------------------------------------------------------------|---------------------------------------------------------------------------|----------------------------------------------------------|
| Birth                  | 2011                                                                     | 2014                                                                      | 2017                                                     |
| Latest Version         | 4.6.0                                                                    | 4.11.3                                                                    | 2.0.1                                                    |
| Weekly Downloads       | 2.2M                                                                     | 1.3M                                                                      | 530K                                                     |
| Contributors           | 1150+                                                                    | 2050+                                                                     | 150+                                                     |
| Methodology            | Object Oriented CSS                                                      | Object Oriented CSS                                                       | Utility-First CSS                                        |
| Processor              | Pre Process                                                              | Pre Process                                                               | Post Process                                             |
| Library Size           | ~308kb                                                                   |                                                                           | ~27kb                                                    |
| React Version          |                                                                          | ^16.8.0                                                                   |                                                          |
| Typescript?            |                                                                          |   (v3.2+)                                                                 |                                                          |
| Browser Support        | IE: 11<br>Edge: >= 80<br>Firefox:>= 60<br>Chrome: >= 60<br>Safari: >= 10 | IE: 11<br>Edge: >= 14<br>Firefox: >= 52<br>Chrome: >= 49<br>Safari: >= 10 | IE:<br>Edge:<br>Firefox:<br>Chrome:<br>Safari:           |
| Roadmap                | https://github.com/twbs/bootstrap/discussions                            | https://material-ui.com/discover-more/roadmap/#roadmap                    | https://github.com/tailwindlabs/headlessui/discussions   |
| Design Figma Artifacts | https://www.figma.com/community/file/876022745968684318                  | https://www.figma.com/community/file/880534892514982400                   | https://www.figma.com/community/file/958383439532195363  |

In all of my use cases I’ve found Material UI (MUI) to have everything I need. The amount of additional developer tools their library expose are perfect for my React apps. So for the rest this journey, we will be focusing on building a React App, using Material UI to help us.

:light_bulb_on: The point of this is to not sway you from the other UI libraries, instead, it was to get you thinking and continuously keep comparing what’s out there.

---
## :rocket: Let's get started!
### Create React App

```bash
create-react-app --template typescript mui-app
cd mui-app
```

The following folder structures should be shown in your code editor (I’m using VSCode).

### Public Folder
![Public Folder Screenshot. Here is where you will store files which are made publicly available to your App. Your "index.html" file is where your Applications root node gets mounted](/img/fed-talk/s01e01/public-folder.png)

### Source Folder
![Source Folder Screenshot. The source directory is where you will write most of your code to build out your app, containing things such as: Tests, Components, Providers etc...](/img/fed-talk/s01e01/source-folder.png)

### package.json file
![Package json file Screenshot. The "dependancies" property is where you should specify node modules which are expected to be used post-build. There is also a property called "devDependancies"; declare node modules there if they are only required to build the Application. The "scripts" property is where you can execute command line scripts. You can add more to this list to do whatevery you like.](/img/fed-talk/s01e01/package-json-file.png)

More information on how the scripts work can be found here: https://create-react-app.dev/docs/available-scripts

---

## :keyboard: Install Material-UI modules
### @material-ui/core
The Core library contains all your base needs, including:

* Components
  * Layouts
  * Inputs
  * Navigation
  * Surfaces
  * Feedback
  * Data Display
  * Utils
  * Lab
* Breakpoint definitions,
* Theme engine,
* Server Side Render Capability,
* A CSS-in-JS solution unlocking many great features (theme nesting, dynamic styles, self-support, etc.)

```bash
// with npm
npm install @material-ui/core

// with yarn
yarn add @material-ui/core
```

## @material-ui/icons
The Icons library includes over a thousand icons, conveniently exposed as SvgIcon components for your consumption. We will dive into this library next episode.

```bash
// with npm
npm install @material-ui/icons

// with yarn
yarn add @material-ui/icons
```

A searchable list of all their icons can be found here: https://material-ui.com/components/material-icons/

![A screenshot of what Material UI Icon library looks like](/img/fed-talk/s01e01/mui-icons-screenshot.png)

Their SVGs come available in a few variations:

| Filled | Outlined | Rounded | Two Tone | Sharp |
|--------|----------|---------|----------|-------|
| ![Filled Icon](/img/fed-talk/s01e01/icon-filled.png)      | ![Outlined Icon](/img/fed-talk/s01e01/icon-outlined.png)        | ![Rounded Icon](/img/fed-talk/s01e01/icon-rounded.png) | ![Two Tone Icon](/img/fed-talk/s01e01/icon-twoTone.png) | ![Sharp Icon](/img/fed-talk/s01e01/icon-sharp.png) |


If their SVG library does not satisfy your needs, MUI have conveniently created a component `<Icon />` where you can inject any of [Font Awesome](https://fontawesome.com/) classes into the component.

```ts
<Icon className="fa fa-plus-circle" />
```

However, if you use the `<Icon />` component, be mindful of accessibility requirements. If your Icon has semantic meaning you are advised to include supporting text around it like so:

```ts
<Icon className="fa fa-plus-circle" />
<Typography variant="srOnly">Create a user</Typography>
```

For this series we will be using MUI Icons, which inherently use <SVGIcon /> (a richer, accessible component)

---

## :wrench: App Preparation
Now that the core libraries have been installed I would then remove all the demonstration content from the `src/App.tsx` file. Following that, we should start to shape our App’s basis by doing the following.

### CssBaseline
> <br >Use the CssBaseline component to kickstart an elegant, consistent, and simple baseline to build upon.<br ><br >

Edit your `App.tsx` file to look something like:

![App.tsx sceenshot](/img/fed-talk/s01e01/app.png)

Upon saving those changes and loading your App, you’ll notice a new `<style>` tag being injected in the `<head>`:

![CSS Baseline style tag](/img/fed-talk/s01e01/basline-screenshot.png)

What this is doing is configuring the browser to print as consistent as it can across all browsers.

> <br >
> Page
> <br ><br >The <html> and <body> elements are updated to provide better page-wide defaults. More specifically:
> - The margin in all browsers is removed.
> - The default Material Design background color is applied. It's using theme.palette.background.default for standard devices and a white background for print devices.
> <br ><br >
> Layout
> <br ><br >
> box-sizing is set globally on the <html> element to border-box. Every element—including *::before and *::after are declared to inherit this property, which ensures that the declared width of the element is never exceeded due to padding or border.
> <br ><br >
> Typography
> <br ><br >
> No base font-size is declared on the <html>, but 16px is assumed (the browser default). You can learn more about the implications of changing the <html> default font size in the theme documentation page.
>
> Set the theme.typography.body2 style on the <body> element.
> Set the font-weight to theme.typography.fontWeightBold for the <b> and <strong> elements.
> Custom font-smoothing is enabled for better display of the Roboto font.
>
> https://material-ui.com/components/css-baseline/
> <br >

---










---

If you have any questions, feel free to [contact-us](https://www.mechanicalrock.io/lets-get-started).
