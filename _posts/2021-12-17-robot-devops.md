---
layout: post
title: Applying DevOps Principles to Robotics
date: 2021-12-17
tags: devops ci cd robotics aws greengrass
author: Simon Bracegirdle
description:
  How can you accelerate your robotics development without compromising on quality and safety? DevOps gives us the DORA metrics, which can help serve as a guide for choosing tools to integrate into our delivery pipeline.
---


The robotics industry continues to evolve as shown by the [growing adoption of commercial quadruped robots](https://trends.google.com/trends/explore?date=all&q=boston%20dynamics). As interest in the field grows so does the number of teams building their own robotics software.

As adoption of their product grows, Robotics teams may look to automate their tooling so that they can maintain a high delivery rate whilst sustaining product stability, safety and reliability.

[DevOps is also increasing in popularity](https://trends.google.com/trends/explore?date=all&q=devops), with the [Google State of DevOps report](https://cloud.google.com/devops/state-of-devops) indicating an increasing number of high performing teams adopting DevOps habits. The DevOps research shows that the four key metrics — Deployment Frequency, Lead Time, Mean Time to Recovery (MTTR) and Change Failure Rate — are [indicative of teams that deliver more value to customers](https://cloud.google.com/blog/products/devops-sre/using-the-four-keys-to-measure-your-devops-performance).

But can we apply DevOps principles to Robotics teams to help increase the cadence of their development — a RoboOps approach? Can we apply the principles in a way that will result in more value for robotics customers?

## What challenges does robotics face?

Let's start by looking at the challenges unique to robotics.

One unique aspect to robotics is the need for integration with hardware that carries out complex tasks. This makes testing more challenging, because hardware is subject to the physical, practical and financial constraints of the real world.

Robots can do real world harm and so we have a responsibility to be mindful of that and do everything we can to minimise the risk.

For example, if you're building a robot that autonomously navigates around the customer's house, you'll want to test the reliability of that system by running a series of test scenarios for each change.

But running a set of fixed scenarios is not enough. Robots are not deterministic systems and have a high degree of variability. Test suites must take this into account by repeating tests with an appropriate level of random input noise.

Testing and developing on hardware can also be difficult because a team may be sharing a limited set of test devices, often constrained to a dedicated test area such as the office garage or car park. This makes it difficult to adequately stress the system with conditions that are representative of their target environment.

In the following sections we'll take a look at some tools that we can utilise in combination with DevOps principles, that may help with teams looking to scale up their development and customer base whilst addressing robotics challenges.


## Tool #1 — Use of simulation in CI

Simulation is a tool for executing tests on robotics behaviour and systems in a software environment that emulates the physical properties of the real world as close as possible. Since simulations are purely a representation, and never precisely match the real world, don't think of them as ground truth, but they're still a useful testing tool.

The key benefit of leveraging robotics simulation is that you can execute tests without any hardware dependencies. Without this constraint, simulations can run on a variety of compute environments — developer laptops, cloud based environments such as AWS RoboMaker, linux containers and more.

This freedom of choice and ease of use frees up team members to develop and test when they like, or as part of an automated testing / continuous integration (CI) toolchain.

Since simulations are not constrained by the physical limits of hardware, you can run them in parallel and at accelerated time rates. This can reduce the time to receive feedback when running test suites.

If a simulation is well designed and runs on every code change it can help to increase deployment frequency and reduce the change failure rate. Teams that are confident in their changes will commit without fear and trust the tool to do its job.

Are there any downsides to Simulation? Well it does take some effort to setup and can be computationally expensive in come cases, so it's worth assessing the value of it for your context.

For example, if you're building a simple system with minimal failure modes, then it may be hard to justify the investment in setting up simulation.

In other cases there are some platforms that do not have good simulation support, in which case you may not have a choice.


### How do you integrate simulation into your workflow?

As a metaphor to traditional software testing, simulation is best characterised as a form of integration testing, since it involves testing the robotics software as a whole, or a subset of the whole, including the impact of software on hardware.

Whilst simulation is faster than real world testing, it's still slower than unit testing and can be computationally expensive.

Given this, if you're planning to run it automatically as part of a CI/CD toolchain, then it's best suited to run after or parallel to unit testing, but before deployment to your non-production environment. 



## Tool #2 — Automate hardware-in-the-loop testing in CI


### What is hardware-in-the-loop testing?

Automating hardware testing involves creating a dedicated space and a scheduled time for use of that space in which test suites run against real hardware.

This may involve talking with others that share this area and agreeing on it's use. This would include deciding when and how testing takes place, and publishing a schedule if necessary.

No matter how good your simulation, for products that include a hardware component, nothing is going to be as good for testing as the real thing.

If your team is making a lot of changes to the product, it can get tedious to setup that testing manually. This is where kicking off testing on real hardware automatically from a CI/CD pipeline can be useful.

For example; if you have made a small code change, you commit this to master. Unit tests and simulation run automatically, if they pass and the test area is available, then the pipeline deploys the latest build to your test hardware and runs tests in the real world.


### How does automated hardware-in-the-loop benefit robotics teams?

The key benefit of integrating this process with CI is to support a high rate of change, making it suitable for teams wanting to write smaller changes and commit more frequently.

Adding hardware testing to your pipeline, alongside unit testing and simulation will form a solid foundation for a comprehensive test suite that will stop issues leaking out to your fleet.

Integrating on-hardware testing into your pipeline will support increasing deployment frequency and reducing change failure rate, by allowing you to push your change and forget it. Setup alerting to let you know if a pipeline fails.

Teams with confidence in their test suite and pipeline will be happy to push and rely on the tooling to do its job, knowing that it's unlikely a serious bug will get into production, and if it does then it'll get rolled back fast.

### How do you integrate automated hardware-in-the-loop into your workflow?

To run tests on real hardware you must first deploy your change to that hardware. Ideally you would also run unit tests and simulation tests before that deployment takes place.

If you separate your fleet into staging (or non-production, or the test environment, whatever you want to call it) and production, then you could first deploy to your staging environment, run the tests on real hardware, and then proceed to deploying to production.

It may also be worth running the tests again after you deploy to the live environment.


## Tool #3 — Continuous fleet deployment


### What are fleet deployments?

If you deploy software to a group of robots or IoT devices, that's a fleet deployment.

Fleet deployments differ in that devices and robots are not co-located — they're often spread out or on different sites entirely and different networks.

Fleet devices can have unreliable connectivity, due to moving through wifi hot spots or using mobile  connections. This means fleet deployments are less reliable than common software deployments. You may get more reliable connectivity at one site versus another.

Deployments can happen manually, or automatically through a CI/CD pipeline. With the latter, developers will commit changes to a branch, run tests and deploy.

Ideally the changes deploy to a staging or non production fleet first, which allows for on-device testing to take place before deployment to the live production fleet.

A manual gate may block the final deployment step for teams that don't have a high degree of automation. But ideally you would automate and build confidence in your testing so can deploy automatically to production after tests pass.

Don't forget to test in production too. Whilst it's good practice to keep environments the same, there's still differences in data and usage. Testing after deployment will uncover any of those further issues and verify the deployment was successful.

One approach is to use a canary-style deployment -- applying updates to a subset of devices at a time and increase the deployment linearly or exponentially. This opens the opportunity to identify issues roll them back before it impacts the entire fleet.

Being able to roll back failed changes automatically is also important. You need a path back to operation without human intervention. This can save phone calls, reduce time to recovery and limit impact to customers.

### How does automated fleet deployment benefit robotics teams?

The key benefit of automating deployment is to support an increase in deployment frequency, and to reduce the mean time to recovery.

By having a process that takes you from code commit to production deployment, verifying the change at each step, and by using that process frequently, you will build confidence in it and move towards pushing smaller changes more frequently.

This allows you to respond faster to bug fixes, to incidents, to small improvements, to everything. You can deliver more value to your customer with less lead time.


### How do you automate fleet deployment in your workflow?

The first step to automating fleet deployment is to integrate it with your CI/CD tool, for example [GitHub Actions](https://github.com/features/actions) or [AWS CodePipeline](https://aws.amazon.com/codepipeline/).

The deployment steps conventionally take place after build and test. First deploy to a staging environment, conduct further testing and then deploy to your live production environment.

To assist in deployment and management of workloads in your fleet, it's worth taking advantage of a fleet or device management tool such as [AWS GreenGrass](https://aws.amazon.com/greengrass/), [Formant](https://formant.io/) or [Rocos](https://www.rocos.io/).

For example; Greengrass V2 components can deploy software to your robot or device fleet. It supports [rolling deployments](https://docs.aws.amazon.com/greengrass/v2/developerguide/create-deployments.html) with options for linear or exponential steps.


## Summary

In this post we introduced three tools that help to support a DevOps approach to development when integrated with your CI/CD pipeline; simulation, automated hardware testing and continuous fleet deployments.

These tools aren't silver bullets — on their own they won't solve your scaling or delivery woes and they're not suitable for all teams. But they can be powerful tools that can help you take positive steps towards a DevOps approach and delivering more value to your customers.

Need help with your fleet deployments? [Then get in contact with the DevOps experts — Mechanical Rock](https://www.mechanicalrock.io/lets-get-started).


