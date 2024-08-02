---
layout: postv2
title: "Exploring the Latest Updates to WayFinder - The Evolution of our Recommendation Engine"
description: "A journey through the complexity of creating a recommendation engine to foster high performing software teams"
date: 2024-8-2
highlight: monokai
image: /img/wayfinder/recommendation_engine.png
author: Hamish Tedeschi
tags:
  [
    WayFinder,
    DevOps,
    DORA Metrics,
    GitHub,
    Gitlab,
    Azure DevOps
  ]
---

## Exploring the Latest Updates to WayFinder

The recent updates to WayFinder have ushered in significant changes, particularly with the development and refinement of its recommendation engine. As WayFinder pivots towards a more refined user experience, the new recommendation engine plays a central role in delivering tailored content and suggestions to users, based on the organisations Product state and the state of that Products (DORA) metrics, such as Lead Time or Deployment Frequency. It is more complex than originally thought, so I wanted to give you a taste of the journey..

<div ><img src="/img/wayfinder/dora_metrics.png"/><p>Image 2: WayFinder Metrics</p></div>



## The Evolution of our Recommendation Engine

The development of WayFinder's recommendation engine has been a journey marked by continuous learning and adaptation. Initially designed to provide recommendations to improve a Products <a href="https://dora.dev/">DORA Metrics</a>, in order to run experiments using Action Plans as a guide; the engine has evolved into a sophisticated system that analyses vast amounts of data to deliver a better experience. This includes recommending specific connector improvements, software engineering improvement recommendations in order to improve the lowest performing DORA metric and incorporating specific feedback from our growing community of users.

One of the key learnings in building this product has been the importance of balancing complexity with usability. The WayFinder team discovered that while a more intricate recommendation algorithm could deliver highly tailored improvement recommendations, it also risked overwhelming users with too many options. To address this, we implemented a tiered recommendation system, where users receive suggestions in a more digestible, prioritised manner.

## Key Features and Updates

#### Connector Recommendations
The engine now leverages machine learning to understand Product team behaviour better, offering suggestions that are based on the state of connectors (ie. is an Incident Management tool yet to be connected?) and includes feedback from users around why specific connectors may or may not be used.

From the outset, the challenge was the large number of tools available in the market for Source Control (ie. GitHub, GitLab etc), the proliferation of tools in the CI/CD space (ie. GitHub Actions, CircleCI, CodeFresh etc) and the ever increasing number of tools in the Incident Management space (from Slack to ServiceNow). Some hard decisions had to be made around which tools to support - naturally we linked this to customer demand. We then mapped out all the possible states that supported connectors may have, which again proved more complicated than one might think - mainly due to the varying implementation detail and behaviour of each. 

A useful tool for understanding and capturing system state and behaviour continues to be <a href="https://blog.mechanicalrock.io/2023/03/21/example-mapping-in-practice">Example Mapping</a>. We use this extensively to understand the state a product may be in and when to serve up which style of recommendation. 

#### Improvement Recommendations
The team has also focused on making the recommendation interface more intuitive and to flow better. By simplifying how recommendations are presented, the platform ensures that users can easily find and engage with new content without feeling overwhelmed. Again, the complexity of improvement recommendations meant that effective use of <a href="https://blog.mechanicalrock.io/2023/03/21/example-mapping-in-practice">Example Mapping</a> was beneficial. From capturing edge cases on which metrics to focus on, the number of recommendations surfaced, which recommendations have already been delivered and which ones are preferred based on the current state of the metrics, effectiveness of the recommendation and other data captured. 

#### Community Feedback Integration
Another significant learning was the value of community feedback. By closely monitoring how users interact with the recommended improvements, we fine-tune the engine to better meet user expectations. This iterative process has been critical in evolving the recommendation system to be more aligned with organisational needs - and more specifically product improvements. 

We have been using <a href="https://sentry.io/welcome/">Sentry</a> to help with this but more importantly also engaging users directly through the product wherever we can, capturing their data and feeding it back into the engine.

## Challenges and Future Directions

Building an effective recommendation engine is not without its challenges. The WayFinder team faced difficulties in handling the vast amount of data required to make accurate recommendations while ensuring that the system remained fast and responsive. Additionally, we learned the importance of transparency; users are more likely to trust and engage with recommendations if they understand why they are being suggested certain content.

Looking forward, WayFinder plans to expand the capabilities of its recommendation engine by incorporating more advanced AI and machine learning techniques. We are also building a feature which will alert product teams BEFORE metrics associated to CI/CD pipelines (ie. Lead Time, Deployment Frequency and Change Failure Rate) are likely to be impacted by upcoming changes in packages, dependancies or run times, so they can take appropriate action. This has been nicknamed "Descalr" - please let us know if you are interested in beta testing this. 

But to be honest, we really want more data. So please sign up <a href="https://app.wayfinder.ninja/signup">here</a>, for FREE, and start your own journey of continuous improvement!

WayFinder now supports GitHub, GitLab, Azure DevOps, ServiceNow and OpsGenie - with plans for more connectors to be released soon. Stay tuned for the next WayFinder update in a few months time.