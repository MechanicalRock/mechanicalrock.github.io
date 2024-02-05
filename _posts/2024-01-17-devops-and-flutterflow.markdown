---
layout: postv2
title: "Role of FlutterFlow in Modern App Development: Insights for DevOps Teams"
description: "FlutterFlow is a visual editor for building Flutter apps. It is a good starting point for building applications; however, beyond a certain size, applications may need to be moved to GitHub to enable DevOps practices as well as robust, secure, and consistent development."
date: 2024-2-2
highlight: monokai
image: /img/devopsflutterflow/cover.png
author: Matthew Carter
tags: [FlutterFlow, Flutter, DevOps, Firebase]
---

# FlutterFlow - A DevOps Perspective

## Introduction

Within a typical product development cycle, after problem identification and solution ideation, one of the best ways to get validation on both is to build a minimum viable product (MVP). There are numerous risks with dedicating resources to building an MVP for validation. However, one way to reduce the cost of failure and to increase time to value is to increase the speed of development.

FlutterFlow is a click and drag development tool to build multi-platform Flutter applications faster than coding from scratch, at least in the initial stages. The tool makes the usual promises of a no-code or low-code development platform. FlutterFlow enables teams to create well rounded MVPs quickly and at a low cost of labour and resources, because it can be done so quickly. FlutterFlow has useful pre-built components, integrations with databases such as Firebase Stores and Supabase as well as authentication providers like Google. This out-of-box functionality means a teams can quickly build out an application for the purposes of an MVP.

The speed of initial development is impressive and has a high value add within an initial product development lifecycle. Though there are limitations of FlutterFlow that mean the production development of an enterprise application should still reside within traditional tooling and code editors. FlutterFlow does offer some enablement of DevOps practices, however, to ensure robust, secure and consistent development going beyond FlutterFlow is for now the best way forward.

To demonstrate FlutterFlow's abilities and how to go beyond the tool, alongside this blog is an app built with FlutterFlow I've called AleFinder. An app to find local pubs in the Perth CBD. This MVP was built within a week of learning FlutterFlow.
<br>

<center>
<div ><img src="/img/devopsflutterflow/what_is_flutterflow_1.png"/><p>Image 1: FlutterFlow UI</p></div>
</center>

## What is FlutterFlow?

### Design and Building

As seen in the image above, FlutterFlow allows you to create pages from scratch or use customizable prebuilt templates. Within AleFinder, it was super ease to use a GoogleMap element to create the map for the demo app. Customizing was relatively simple using the provided documentation. In addition, there are templates and elements that make up the draggable and droppable parts of your MVP. I used a prebuilt travel card to showcase different potential Ales 🍻.

<center>
<div ><img src="/img/devopsflutterflow/what_is_flutterflow_google_widgets.png"/><p>Image X: GoogleMap element used in AleFinder</p></div>
<div ><img src="/img/devopsflutterflow/what_is_flutterflow_templates.png"/><p>Image X: Prebuilt templates</p></div>
<div ><img src="/img/devopsflutterflow/what_is_flutterflow_elements.png"/><p>Image X: Prebuilt Elements</p></div>
</center>
<div style="display:flex;justify-content:center;align-items: center;"><div><img src="/img/devopsflutterflow/what_is_flutterflow_travel_card_possible_ale.png"/><p>Image X: Prebuilt Elements</p></div></div>

### Authentication

In addition, there are also numerous prebuilt and changeable sign up and login pages. This is a great feature for MVPs as it allows you to quickly build out a login page and authentication flow to ultimately collect sign ups.

<center>
<div><img src="/img/devopsflutterflow/what_is_flutterflow_page_templates.png"/><p>Image X: Content page templates</p></div>
<div><img src="/img/devopsflutterflow/what_is_flutterflow_auth.png"/><p>Image X: Auth page templates</p></div>
</center>

In addition to create a sign up and login page, FlutterFlow can easily integrate with Firebase and Supabase authentication providers. You can use your own authentication provide however that will require additional effort. Steps found <a href="https://docs.flutterflow.io/data-and-backend/custom-authentication">here</a>. It took less than 5 clicks to spin up Firebase authentication for this application with FlutterFlow though there was some minimal setup to complete within the firebase console.

<center>
<div><img src="/img/devopsflutterflow/what_is_flutterflow_auth_2.png"/><p>Image X: Firebase setup in FlutterFlow</p></div>
<div><img src="/img/devopsflutterflow/what_is_flutterflow_firebase_console.png"/><p>Image X: Firebase Console setup</p></div>
</center>

### Databases & APIs

There are three easy methods of enabling Create, Replace, Update and Delete operations withing FlutterFlow. They are Firebase, Supabase and API integrations. Firebase and Supabase are both no-code database solutions that are both easy to setup and use. Firebase is a Google product and Supabase is an open source alternative. Both have free tiers and are easy to setup. I used Firebase for AleFinder as you can deploy a Firebase project from withing FlutterFlow and within the setup you can enable authentication and Firestore.

<center>
<div ><img src="/img/devopsflutterflow/database_firebase_config_1.png"/><p>Image X: Firebase Setup</p></div>
<div ><img src="/img/devopsflutterflow/api_testing_2.png"/><p>Image X: API Testing</p></div>
</center>
</div>

## Drawbacks of FlutterFlow

As described above you can create simply CRUD app very easily and quickly using the tooling above. However, there are some drawbacks to FlutterFlow that mean it is not a complete solution for production development. However, hat would be considered 'production development' though? This could be defined as the development of an application that will be built by a large number of developers, will have a large number of features, and will be maintained over a long period. But specifically, the bottle neck of click-ops tools like FlutterFlow is the difficulty to scale with larger teams.

For example, although there are collaboration-centered features available, such as real-time collaboration and an activity log, the concept of a pull request is rather loosely adopted. A pull request is vital to ensure changes are reviewed and tested.. In FlutterFlow, for teams and enterprise users, the ability to branch and merge changes is available, however, there is no ability to require automated tests or review of another developer. Furthermore, the ability to roll back a merge is not available, but you can abort a merge or branch during development. In addition, the versioning of changes is somewhat opaque. There is a list view of changes, however, you cannot click an element or page and see an equivalent commit history.

<center>
   <div>
      <img src="/img/devopsflutterflow/collaboration.png"/>
      <p>Image X: Collaboration </p>
   </div>
</center>

The ability to create the infrastructure associated with your app's infrastructure is also limited. For example, you can't manage your Firebase resources in with version control or require reviews of changes, like you would with a Terraform project. If you want to use Terraform you have to create the infrastructure outside of FlutterFlow and then integrate it with your Firebase project.

There is also a heavy association with Firebase and associated services. As mentioned, authentication via a non-supported service is very difficult. Once you move past the MVP stage of development, if your plan is to leave Firebase and move to a different authentication provider, you will have to do a lot of work to move away from Firebase the later you leave FlutterFlow. With this in mind here, are some ways to mitigate these drawbacks.

## Beyond FlutterFlow

FlutterFlow is a good starting point but if you have a growing team of developers, or you want to ensure robust, secure and consistent development, you will need to move beyond FlutterFlow. There are a few ways to do this. Note: All users can only export their code in Flutter.

### Integrating with Github

FlutterFlow can integrate with Github for teams and enterprise users. After making your changes you can periodically push your changes to a branch in Github. This allows you to create pull requests that require successful automated testing and reviews before merging. This also allows you to use Github actions to build and deploy your application. This is a good way to ensure robust, secure and consistent development.

<center>
   <div>
      <img src="/img/devopsflutterflow/flutterflow_and_github.png"/>
      <p>Image X: FlutterFlow and Github </p>
   </div>
</center>

However, though this might ensure more robust deployments in theory, the ability to publish from FlutterFlow can't be disabled as far as I can tell. This means that the pull request associated with code changes from FlutterFlow might not be reviewed or might have failing associated tests but the changes can still make their way to production.

More information on integrating FlutterFlow with Github can be found <a href='https://docs.flutterflow.io/settings-and-integrations/integrations/github'>here </a>.

### Exporting Code Base

It might become apparent that your team is ready to move on from FlutterFlow completely. This might be because you've successfully proven an MVP that you would like to handover to a enterprise grade development team or you've decided that the drawbacks of FlutterFlow are too great. In either case, you can export your code base from FlutterFlow and continue development in a IDE alongside tools like GitHub, CodeFresh etc. To do this, is very simple and easy to do.

<center>
   <div>
      <img src="/img/devopsflutterflow/export_code_base.png"/>
      <p>Image X: Exporting FlutterFlow</p>
   </div>
</center>

These are the options for enterprise users which make it super easy and convenient to export your app in many different ways. I would recommend either downloading the code base entirely or connecting a repo and then forking it or remove FlutterFlow's access.

However, for free users this is arguably not possible. For free users of FlutterFlow you can view the code that makes up your app, however, if you use are FlutterFlow widgets or any of the following like I did. You will not be able to run the code locally.

```dart
import '/flutter_flow/flutter_flow_google_map.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
```

This is because this code is FlutterFlow's and there is no way to download these dependencies in the free version. There are GitHub repos that claim to be able to replace these dependencies, however, users have had mixed success.

## DevOps and FlutterFlow

### Automated Testing

A foundational pillar of DevOps is automated testing. This allows for rapid, confident development as with automated testing, within test driven development, we can quickly catch breaking changes to our code and ensure critical functionality of our application and its components is maintained.

FlutterFlow claims to facilitate automated testing. However, upon closer inspection, this is seemingly a half baked feature. There are three types of tests that <i>Flutter</i> supports which is unit tests, widget tests and integration tests. The only type of tests you can create in FlutterFlow is integration tests. In the spirit of FlutterFlow, the automated testing is a click-ops tool. In some ways it is similar to `codegen` functionality of testing libraries like <a href="https://playwright.dev/">playwright</a>. Here is an example of an automated test in FlutterFlow.

<center>
   <div>
      <img src="/img/devopsflutterflow/automated_testing.png"/><p>Image X: Automated Testing in FlutterFlow </p>
   </div>
</center>

You can design tests in FlutterFlow with three possible actions:

1. Interact with a widget
   - Tap, double tap, long press, enter text, scroll until visible.
2. Wait to Load
3. Expect Result
   - Find widget(s) or find nothing with text or without.

The selection methods of the interactions and expecting a result are:

- Selecting from the UI which is live alongside the testing suite, which is admittedly nice.
- ValueKey: A unique identifier, also known as a testing id, for a widget.
- Tooltip: Find a widget that displays a specific tooltip.
- Semantics Label: This is useful for identifying widgets that are associated with a specific semantics label.
- Text: A widget that shows a particular text.
- Descendent: Widget that contains a specific child or ancestor.

This is an exhaustive list, which speaks to limited nature of these automated tests within FlutterFlow. Though, to FlutterFlow's credit you can specify preconditions such as being logged in with a specific username and password.

The major issue I have with this automated testing functionality is that its not possible to run these tests in FlutterFlow. There are two methods of running these automated tests, they can be run locally after downloading the code base or using Firebase Test Lab. Both of which require you to download the code base. This means there is no way to automate the execution of tests before publishing changes to your app from within FlutterFlow. With this, the aforementioned benefits of automated testing in a DevOps context is not satisfied with this functionality.

More information on automated testing in FlutterFlow can be found <a href="https://docs.flutterflow.io/deploying-your-app/testing-your-app/automated-tests">here</a>.

### CI/CD

Continuous Integration and Continuous Deployment (CI/CD) is the process of merging software engineer's working copies of a common project as well as the automated testing and deployment of those changes. Within larger software teams there are two common strategies for this, trunk based development and GitFlow feature branching. Both of these strategies require a robust CI/CD pipeline to ensure that changes are tested and reviewed before being merged into the main branch. DevOps teams often opt for trunk based development on the caveat that there is strong automated testing. FlutterFlow supports both strategies in theory, as users can branch and merge changes but note this is only available for teams and enterprise users. Though there is automated merging and deployment of changes when merging and publishing a FlutterFlow app, there is no way to enforce reviews or testing before publishing. In my opinion, FlutterFlow's CI/CD is the equivalent of a developer pushing to the main branch without a pull request. This is not a robust CI/CD pipeline and is not suitable for production development.

### Version control

Version control in the context of DevOps is the ability to track changes to your code base and to be able to roll back changes if necessary. FlutterFlow has a version control system that is automatically versioned with each deployment. However, the versioning is opaque. There is a list view of changes each user makes, however, you cannot click an element or page and see an equivalent commit history.

<center>
   <div>
      <img src="/img/devopsflutterflow/devops_collaboration.png"/>
      <p>Image X: "Collaboration" in Version Control </p>
   </div>
</center>
This is a major drawback of FlutterFlow's version control system. In a production development environment, teams need to be able to see the changes that were made to a specific element or page and be able to roll back those changes if necessary. This is not possible with FlutterFlow's version control system. As a consequence, I imagine a production failure would be difficult to diagnose and fix.

## Conclusion

FlutterFlow emerges as a highly effective tool for rapidly developing minimum viable products (MVPs) in the realm of modern app development. It has a slick design, pre-built components, and seamless integrations with databases and authentication providers Firebase and Supabase make it an ideal choice to validate ideas quickly and efficiently.

However, as an application grows in complexity and size, the limitations of FlutterFlow become apparent. The platform, while excellent for initial development, does not enable production-level app development. DevOps practices such as robust version control, comprehensive automated testing, and a secure, consistent development environment necessitate a transition to more traditional development tools and platforms like GitHub.

If you have any questions or would like to discuss FlutterFlow further, please feel free to reach out to Mechanical Rock.
