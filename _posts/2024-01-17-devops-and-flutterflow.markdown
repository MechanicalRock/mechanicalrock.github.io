---
layout: postv2
font: serif
title: "Role of FlutterFlow in Modern App Development: Insights for DevOps Teams"
description: "FlutterFlow is a visual editor for building Flutter apps. It is a good starting point to move github and use DevOps practices to build out a full app"
date: 2023-10-17
highlight: monokai
image: img/devopsflutterflow/cover.png
author: Matthew Carter
tags: [FlutterFlow, Flutter]
---

# Role of FlutterFlow in Modern App Development: Insights for DevOps Teams

## Introduction

Within a typical product development cycle, after problem identification and solution ideation, one of the best ways to get validation on both is to build an minimum viable product (MVP). There are numerous risks with dedicating resources to building an MVP for validation. However, one way to reduce the cost of failure and to increase time to value is to increase the speed of development.

FlutterFlow is a click and drag development tool to build multi-platform Flutter applications faster than coding from scratch, at least in the initial stages. The tool makes the usual promises of a no-code or low-code development platform. FlutterFlow enables teams to create well rounded MVPs quickly and at a low cost of labour and resources, because it can be done so quickly. FlutterFlow, has useful pre-built components, integrations with databases such as Firebase Stores and Supabase as well as authentication providers like Google and Apple. This out-of-box functionality means a teams can quickly build out an application for the purposes of an MVP.

The speed of initial development is impressive and has a high value add within an initial product development lifecycle. Though there are limitation of FlutterFlow that mean the production development of an enterprise application should still reside within traditional tooling and code editors. FlutterFlow does offer some enablement of DevOps practices, however, to ensure robust, secure and consistent development going beyond FlutterFlow is for now the best way forward.

To demonstrate FlutterFlow's abilities and how to go beyond the tool, alongside this blog is an app built with FlutterFlow I've called AleFinder. An app to find local pubs in the Perth CBD. This MVP was built within a week of learning FlutterFlow and was exported to Github where it possesses a CI/CD pipeline and additional automated tests.
<br>

<div style="display:flex;justify-content:center;align-items: center;gap:20px">
<div ><img src="/img/devopsflutterflow/what_is_flutterflow_1.png" height="500px"\><p>Image 1: FlutterFlow UI</p></div>
</div>

## What is FlutterFlow?

- A visual editor for building Flutter apps
- Extensive templates and pre-built components
- Database integrations
- Authentication
- Export to code

### Design and Building

As seen in the image above, FlutterFlow allows you to create pages from scratch or use customizable prebuilt templates. Within AleFinder, it was super ease to use a GoogleMap element to create the map for the demo app. Customizing was relative simple using the provided documentation. In addition there are templates and elements that make up the draggable and droppable parts of your MVP. I used a prebuilt travel card to showcase different potential Ales 🍻.

<div style="display:flex;justify-content:center;flex-wrap:wrap;align-items: center;gap:20px">
<div ><img src="/img/devopsflutterflow/what_is_flutterflow_google_widgets.png" height="300px"\><p>Image X: GoogleMap element used in AleFinder</p></div>
<div ><img src="/img/devopsflutterflow/what_is_flutterflow_templates.png" height="400px"\><p>Image X: Prebuilt templates</p></div>
<div ><img src="/img/devopsflutterflow/what_is_flutterflow_elements.png" height="400px"\><p>Image X: Prebuilt Elements</p></div>
</div>
<div style="display:flex;justify-content:center;align-items: center;"><div><img src="/img/devopsflutterflow/what_is_flutterflow_travel_card_possible_ale.png" height="400px"\><p>Image X: Prebuilt Elements</p></div></div>

### Authentication

In addition, there are also numerous prebuilt and changeable sign up and login pages. This is a great feature for MVPs as it allows you to quickly build out a login page and authentication flow.

<div style="display:flex;justify-content:center;flex-wrap:wrap;align-items: center;gap:20px">
<div><img src="/img/devopsflutterflow/what_is_flutterflow_page_templates.png" height="300px"\><p>Image X: Content page templates</p></div>
<div><img src="/img/devopsflutterflow/what_is_flutterflow_auth.png" height="300px"\><p>Image X: Auth page templates</p></div>
</div>

In addition to create a sign up and login page, FlutterFlow can easily integrate with Firebase and Supabase authentication providers. You can use your own authentication provide however that will required addition effort. Steps found <a href="https://docs.flutterflow.io/data-and-backend/custom-authentication">here</a>. It took less than 5 clicks to spin up Firebase authentication for this application with FlutterFlow though there was some minimal setup to complete within the firebase console.

<div style="display:flex;justify-content:center;flex-wrap:wrap;align-items: center;gap:20px">
<div><img src="/img/devopsflutterflow/what_is_flutterflow_auth_2.png" height="300px"\><p>Image X: Firebase setup in FlutterFlow</p></div>
<div><img src="/img/devopsflutterflow/what_is_flutterflow_firebase_console.png" height="300px"\><p>Image X: Firebase Console setup</p></div>
</div>

### Database

## Beyond FlutterFlow

- FlutterFlow is a good starting point but you can push the entire code base to github

## DevOps and FlutterFlow

- Automated Testing
  - Flutter Integration tests and firebase test lab
  - Need a pro plan
- Version control
  - Can ClickOps it but better to use git
- CI/CD & Trunk Based Development
  - Not possible to enforces testing before publishing
  - Can use github actions to build and publish

## Drawbacks of FlutterFlow

- DevOps practices really need github and CI/CD.
- Heavy integration with Firebase and associated services

## Conclusion

- Great for MVP in product dev lifecycle
- Production development needs github and CI/CD
