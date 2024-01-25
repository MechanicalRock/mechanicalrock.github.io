---
layout: postv2
font: serif
title: "Role of FlutterFlow in Modern App Development: Insights for DevOps Teams"
description: "FlutterFlow is a visual editor for building Flutter apps. It is a good starting point for building applications, however, at a certain size applications may need to be moved GitHub to enable DevOps practises as well as robust, secure and consistent development"
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

In addition to create a sign up and login page, FlutterFlow can easily integrate with Firebase and Supabase authentication providers. You can use your own authentication provide however that will require additional effort. Steps found <a href="https://docs.flutterflow.io/data-and-backend/custom-authentication">here</a>. It took less than 5 clicks to spin up Firebase authentication for this application with FlutterFlow though there was some minimal setup to complete within the firebase console.

<div style="display:flex;justify-content:center;flex-wrap:wrap;align-items: center;gap:20px">
<div><img src="/img/devopsflutterflow/what_is_flutterflow_auth_2.png" height="300px"\><p>Image X: Firebase setup in FlutterFlow</p></div>
<div><img src="/img/devopsflutterflow/what_is_flutterflow_firebase_console.png" height="300px"\><p>Image X: Firebase Console setup</p></div>
</div>

### Databases & APIs

There are three easy methods of enabling Create, Replace, Update and Delete operations withing FlutterFlow. They are Firebase, Supabase and API integrations. Firebase and Supabase are both no-code database solutions that are both easy to setup and use. Firebase is a Google product and Supabase is an open source alternative. Both have free tiers and are easy to setup. I used Firebase for AleFinder as you can deploy a Firebase project from withing FlutterFlow. Within the setup you can enable authentication and Firestore.

<div style="display:flex;justify-content:center;flex-wrap:wrap;align-items: center;gap:20px">
<div ><img src="/img/devopsflutterflow/database_firebase_config_1.png" height="250px"\><p>Image X: Firebase Setup</p></div>
<div ><img src="/img/devopsflutterflow/api_testing_2.png" height="250px"\><p>Image X: API Testing</p></div>
</div>
</div>

## Drawbacks of FlutterFlow

- DevOps practices really need github and CI/CD.
- Infra would have to be IaC'd somewhere else
- Heavy integration with Firebase and associated services.
  - Customizations are possible but the effort for something like custom auth is high.

As described above you can create simply CRUD app very easily and quickly using the tooling above. However, there are some drawbacks to FlutterFlow that mean it is not a complete solution for production development. What would be considered 'production development' though? This could be defined as the development of an application that is going to be used by a large number of developers, has a large number of features and is going to be maintained for a long period of time. But specifically, the bottle neck of Click Ops tools like Flutterflow is the difficulty to scale with larger teams.

For example, though there collaboration centred features available, such as real-time collaboration and an activity log, however the concept of a pull request is rather loosely adopted. A pull request is vital for ensure changes are reviewed and tested. In Flutterflow, for teams and enterprise users, the ability to branch and merge changes is available, however, there is no associated automated tests or required review of another developer. Further, the ability to roll back a merge is also not available but you can abort a merge or branch in development. In addition, the versioning of changes is somewhat opaque. There is a list view of changes, however, you cannot click an element or page and see an equivalent commit history.

<div ><img src="/img/devopsflutterflow/collaboration.png" height="250px"\><p>Image X: Collaboration </p></div>

The ability to create the infrastructure associated with your app's infrastructure is also limited. For example, you can't manage your Firebase resources in a version control or reviewed way like you would with Terraform cloud. If you want to use Terraform you have to create the infrastructure outside of FlutterFlow and then integrate it with FlutterFlow.

There is also a heavy association with Firebase and associated services. As mentioned, authentication via a non-supported service is very difficult. Once you move past the MVP stage of development, if your plan is to leave Firebase and move to a different authentication provider, you will have to do a lot of work to move away from Firebase the later you leave Flutterflow. With this in mind here, are some ways to mitigate these drawbacks.

## Beyond FlutterFlow

FlutterFlow is a good starting point but if you have a growing team of developers, or you want to ensure robust, secure and consistent development, you will need to move beyond FlutterFlow. There are a few ways to do this.

### Integrating with Github

FlutterFlow can integrate with Github for teams and enterprise users. After making your changes in Flutterflow you can periodically push your changes to a branch in Github. This would allow you to create pull requests that require successful automated testing and reviews before merging. This would also allow you to use Github actions to build and deploy your application. This is a good way to ensure robust, secure and consistent development.

<div ><img src="/img/devopsflutterflow/flutterflow_and_github.png" height="250px"\><p>Image X: Flutterflow and Github </p></div>

However, though this might ensure more robust deployments in theory, the ability to publish from Flutterflow can't be disabled as far as I can tell. This means that the pull request associated with code changes from Flutterflow might not be reviewed or might have failing associated tests but the changes can still make their way to production.

More information on integrating Flutterflow with Github can be found <a href='https://docs.flutterflow.io/settings-and-integrations/integrations/github'>here </a>.

### Exporting Code Base

It might become apparent that your team is ready to move on from Flutterflow.

## DevOps and FlutterFlow

- Automated Testing
  - Flutter Integration tests and firebase test lab
  - Need a pro plan
- Version control
  - Will automatically version with each deployment and can ClickOps it but might be better to use git
  - Has Opaque Versioning - there is a list view of changes, can't click an element or page and see an equivalent commit history. - devops_collaboration.png
- CI/CD & Trunk Based Development
  - Can branch and merge in FlutterFlow
  - Not possible to enforces testing before publishing
  - Can use github actions to build and publish

## Conclusion

- Great for MVP in product dev lifecycle
- Production development needs github and CI/CD
