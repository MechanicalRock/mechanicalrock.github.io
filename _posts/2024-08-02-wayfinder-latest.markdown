---
layout: postv2
title: "Exploring the Latest Updates to WayFinder - The Evolution of Its Recommendation Engine"
description: "A journey through the complexity of creating a recommendation engine for software develeopment performance"
date: 2024-8-2
highlight: monokai
image: /img/wayfinder/recommendation_engine.png
author: Hamish Tedeschi
tags:
  [
    WayFinder,
    DevOps,
    DORA,
    GitHub,
    Gitlab,
    Azure DevOps
  ]
---

## Exploring the Latest Updates to WayFinder

The recent updates to WayFinder have ushered in significant changes, particularly with the development and refinement of its recommendation engine. As WayFinder pivots towards a more refined user experience, the new recommendation engine plays a central role in delivering tailored content and suggestions to users, based on the organisations state and the state of the Products metrics. It has been more complex than originally thought, so I wanted to give you a taste of the journey..

<div ><img src="/img/wayfinder/dora_metrics.png"/><p>Image 2: WayFinder Metrics</p></div>



## The Evolution of our Recommendation Engine

The development of WayFinder's recommendation engine has been a journey marked by continuous learning and adaptation. Initially designed to provide recommendations to improve a Products DORA Metrics, in order to run experiments (using Action Plans as a heuristic), the engine has evolved into a sophisticated system that analyses vast amounts of data to deliver a better experience. This includes recommending specific connector improvements, software engineering improvement recommendations in order to improve the lowest performing DORA metrics or incorporating specific feedback from our growing community of users.

One of the key learnings in building this system was the importance of balancing complexity with usability. The WayFinder team discovered that while a more intricate recommendation algorithm could deliver highly tailored improvements, it also risked overwhelming users with too many options. To address this, we implemented a tiered recommendation system, where users receive suggestions in a more digestible, prioritised manner.


## Key Features and Updates:

#### Connector Recommendations: 
The engine now leverages machine learning to understand organisation behaviour better, offering suggestions that are based on the state of connectors (ie. Incident Management not yet connected) and includes feedback from users around why some connectors may or may not be used.

#### Improvement Recommendations: 
The team has been focused on making the recommendation interface more intuitive and flow better. By simplifying how recommendations are presented, the platform ensures that users can easily find and engage with new content without feeling overwhelmed.

#### Community Feedback Integration: 
Another significant learning was the value of community feedback. By closely monitoring how users interact with the recommended improvements, WayFinder’s developers could fine-tune the engine to better meet user expectations. This iterative process has been critical in evolving the recommendation system to be more aligned with organisational needs.

## Challenges and Future Directions

Building an effective recommendation engine is not without its challenges. The WayFinder team faced difficulties in handling the vast amount of data required to make accurate recommendations while ensuring that the system remained fast and responsive. Additionally, we learned the importance of transparency; users are more likely to trust and engage with recommendations if they understand why they are being suggested certain content.

Looking forward, WayFinder plans to expand the capabilities of its recommendation engine by incorporating more advanced AI and machine learning techniques. But to be honest, we need more data. So please sign up <a href="https://app.wayfinder.ninja/signup">here</a>, for free!