---
layout: post
title:  "Continuous Deployment - The First Step on Your Road to Recovery"
date:   2019-05-10
tags: devops continuous-delivery lean trunk-based-development
author: Tim Myerscough
image: img/continuous-deployment-the-first-step/421px-FlexLean_Production_Line.jpg
---
[Systems thinking](https://itrevolution.com/the-three-ways-principles-underpinning-devops/) in DevOps is about improving the flow of work into production.  Hand-offs, re-work and batching are all enemies of flow.  Teams don't intentionally reduce flow.  Hand-offs and approvals are mechanisms introduced in an attempt to tackle the risks of delivery.  Value is generated through change.  Change is the enemy of stability.  [Conway's law](https://en.wikipedia.org/wiki/Conway%27s_law) describes how _systems architecture is a reflection of organisational structure_.  I say __your deployment pipeline is a reflection of your reporting structure__.  

Continuous deployment is a goal for most teams: a lofty ambition that other people achieve.  For Mechanical Rock, continuous deployment is our starting point.  And continuous deployment starts with continuous delivery and a suitable branching strategy.

Your branching strategy is a fundamental decision for development teams and has profound effects upon your working practices.  Making a poor choice has knock on effects that can limit improvements in other areas.  

The goal of [continuous delivery](https://continuousdelivery.com/) is:
> To make deployments—whether of a large-scale distributed system, a complex production environment, an embedded system, or an app—predictable, routine affairs that can be performed on demand.
> We achieve all this by ensuring our code is always in a deployable state

Or more simply: “if it hurts, do it more often, and bring the pain forward.”

# Damming the Flow

A common branching strategy adopted by many teams is [git flow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)[*](#1).  

![GitFlow diagram](/img/continuous-deployment-the-first-step/gitflow.svg)

The goals for GitFlow are in direct conflict with the goals of Continuous Delivery and maximising flow, as [highlighted by the originator](https://nvie.com/posts/a-successful-git-branching-model/):
> We consider origin/master to be the main branch where the source code of HEAD always reflects a production-ready state.
> We consider origin/develop to be the main branch where the source code of HEAD always reflects a state with the latest delivered development changes for the next release.

Maintaining multiple long-lived branches are an inhitibor to flow.  Changes queue on a branch, waiting for release to production.  They add complexity in understanding the divergence between branches, increasing the risk of regressions and merge hell.  This risk grows exponentially with the number of branches maintained.  Furthermore, the increased complexity of managing multiple branches, and the batching of commits, increases the complexity of a release and therefore the associated risk.  As a result, this leads to a downward spiral of increased batching, complexity and risk.

Teams choose git flow for well intentioned reasons.  Faith in the codebase is low, caused by insufficient feedback on changes provided by a comprehensive automated test suite.  This leads to regular issues being found, further reducing faith.  Teams want control over feature releases: when they are confident of the quality. Batching and branching are an attempt to provide the stability to regain control.  However, it [has been shown](https://continuousdelivery.com/evidence-case-studies/) that these practices inhibit, rather than enable, flow.

# Releasing the pressure

A good practice of [The First Way](https://itrevolution.com/the-three-ways-principles-underpinning-devops/) is [one piece flow](https://www.kaizenworld.com/kaizen/one-piece-flow.html).  Work on single increments of value, delivering them as soon as possible.  

As Behaviour Driven Development practitioners, we like to [_start with the end in mind_](https://cucumber.io/blog/cukeup-au-2015-videos/#sharon-robson).  We consider the goal we are trying to achieve, and work backwards to discover how to achieve it.  Many teams consider one piece flow as the final step in their improvement of flow.  Many teams never get there, nor make the changes necessary in order to deliver it.  Manual approval gates are never removed; confidence in the code remains low; automated test coverage remains poor; big batch releases are common.

One piece flow - a simple idea with a simple implementation: continuous deployment. Every commit flows through your continuous delivery pipeline and, assuming all conditions pass, makes its way to production.  The idea and the implementation are simple, but there are a number of fundamental principles that you must adhere to:
 - You have a single, consistent pipeline flow of changes into production
 - You must have confidence in your pipeline to publish changes to the next stage
 - In order to have confidence, you need a high level of automated test coverage.
 - In order to prevent bottlenecks, you need a highly automated pipeline
 
Rather than making it an aspiration, we have found that starting with continuous deployment is the first step to maximising flow.  Fundamental to that approach is [trunk based development](https://trunkbaseddevelopment.com/).  Good practice, such as [branch by abstraction](https://martinfowler.com/bliki/BranchByAbstraction.html) and [feature toggling](https://en.wikipedia.org/wiki/Feature_toggle) occur as a result of the move to trunk based development in order to effectively manage complexity and maintain flexibility.  System architecture becomes simple, flexible and decoupled, driven by the need to reduce risk.

In trunk based development, the team works from a single master branch, with short lived feature branches for managing review and CI cycles:
![Trunk Based Development diagram](/img/continuous-deployment-the-first-step/tbd.png)[**](#2)

If you have a dysfunctional delivery pipeline, continuous deployment can't happen overnight.  Automatically releasing to production would be folly.  Technical debt needs to be paid down in order to release the blockage.  This is waste that has always been there, but changing the process will make it visible. The following structured approach provides metrics required to pay down the technical debt and remove the bottlenecks:
1. Switch to Trunk Based development.  Tag releases to production, and use short lived release branches for hot-fixes 
1. Map out your continuous delivery pipeline to production, including any manual steps.  
1. Remove all manual approval gates up to production deployment. This immediately highlights waste in the value stream.  Issues found late in QA demonstrate a lack of automated testing; manual deployment processes increase lead times.  Complex deployment and extended outages highlight an inflexible architecture.
1. Introduce one piece flow on master - if there are manual steps, this will highlight bottlenecks.

We are consistently able to deploy changes, with confidence, to production multiple times per day.  We use stop-the-line processes to maintain flow.  We still have branches, and PRs, but continually look to improve by reducing their lifetime, including pairing.

We have helped clients move from release cycles taking months, to days.

----

Header image licenced by [Zen Wave](https://commons.wikimedia.org/wiki/File:FlexLean_Production_Line.jpg) under [Creative Commons BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.en)

<a name="1"></a>GitFlow diagram: Copyright Atlassian https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow, Licenced under [Creative Commons Attribution 2.5](http://creativecommons.org/licenses/by/2.5/au/)

<a name="2"></a> http://trunkbaseddevelopment.com/
