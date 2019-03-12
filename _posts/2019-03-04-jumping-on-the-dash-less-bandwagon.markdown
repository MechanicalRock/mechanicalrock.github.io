---
layout: post
title:  "Jumping on the '-less' Bandwagon"
date:   2019-03-04
tags: serverless
author: Pete Yandell
image: img/bandwagonless/bandwagonless.png
---

<img style="display: block; margin-left: auto; margin-right: auto; width: 40%;" alt="wagon wheel" src="{{ site.url }}/img/bandwagonless/bandwagonless.png"/>

## Introduction

It has been awhile since I made my [last post](https://mechanicalrock.github.io/2018/08/27/inception-pipelines-pt6), the one where at the end I promised something about the [AWS CDK](https://awslabs.github.io/aws-cdk/) and how awesome it was going to be. Since then a few of my colleagues have mastered it, and I got super excited by something else.

That something else is SER-VER-LESS!! And so now, I too, am _Jumping on the '-less' Bandwagon!_

## What is serverless and why all the hype?

If you scour the Internet, you will find as many definitions as there are search results. Most of them dive into esoteric technical definitions of what is and isn’t serverless.

My technical perspective is that I don’t consider building, running and managing containers as serverless. I also don't count no-infrastructure pieces of your architecture like DynamoDB, Identity management, payment gateways, etc as Serverless either. They are however critical ‘no-ops’ pieces to operating Serverlessly. What’s left is really the functions-as-a-service services like AWS Lambda, Google Functions and Azure Functions. These functions strip away everything that are not critical core features that are unique to your business (versus structural piece like databases)

Outside the technical realm, Serverless is also a mindset that flows right back into the core how your business operates. In the next section, I’ll discuss why fully embracing serverless very likely means a shakeup of how IT operates. All traditional IT roles come into question when you consider how much of the day-to-day work that IT people do isn’t directly related to delivering value. Serverless is a great mechanism for identifying waste.

**Link of Interest:** [Contemporary Views on Serverless and Implications](https://m.subbu.org/contemporary-views-on-serverless-and-implications-1c5907c611d8)

## Business Impacts

If you’re non-technical then you are probably wondering why you should care about Serverless. After all, isn't it just another buzzword? Actually, Serverless is going to have more of an impact on how you work and operate your business than it will for the techies implementing it. Speed, visibility and agility is what it’s all about.

Serverless is about speed. In my time at Mechanical Rock, I have personally received an end-to-end feature request (web, backing code and accompanying infrastructure) in the morning and delivered it to production fully tested by lunch time. A by-product of speed is the ability to experiment. Why try out just one idea, when it's possible to try out multiple ideas, gather the results and then implement the best bits?

Serverless grants unrivalled visibility into the cost and profitability of your business at an incredibly fine-grained level. You can literally see how much it costs to provide the ‘Contact us’ form on your website. Don’t believe me? Read the thought-provoking article at the end of this section.

Serverless agility is about the highlighting (and hopefully the removal) of waste. Anything that gets in the way of delivering value is immediately highlighted, so if it is a technical hurdle then go around it; if its operational then work out how to kill it or change it. End customers don’t care about what bureaucracy you think you need, they’ll vote with eyeballs and wallets and just go somewhere else if you can’t deliver the goods.

**Link of Interest:** [Micro-Optimization: Activity-Based Costing for Digital Services?](https://aws.amazon.com/blogs/enterprise-strategy/micro-optimization-activity-based-costing-for-digital-services/)

## Technical Impacts

For all you technical readers out there, be afraid of serverless. It isn’t a flash in the pan buzzword that’s going away. It is coming for you and will make you obsolete if you don’t adapt. The full power of serverless requires a different way of working and thinking.

Firstly, it removes the infrastructure downtime between tasks. In the past you’d have to wait for servers to become available. Then you need to wait for software (like application servers) to be installed and configured. Then it was gaining database access for your code. Etcetera etcetera etcetera. With serverless, once you have your access permissions, you can have a brand-new application, in production, within hours. Everything needed to host and operate your application is provided to you by the cloud provider.

Next, with all this infrastructure provided to you, gone are hours or days of writing boilerplate code. All the lambda functions I’ve written listen for an incoming event (http, file, database, whatever) and consume it. No setting up scaffolding code. No writing complex convoluted setup logic for unit tests. Just the minimum code to consume the event and suite of testing scenarios to verify the behaviours that I expect. [Single Responsibility Principle](https://en.wikipedia.org/wiki/Single_responsibility_principle) at its finest.

Time to think in terms of events and states as ultimately you’re responding to state change events within the bounds of a fully distributed system. This requires a more disciplined focus on what triggers these events and how things can, and will, [go awry at any time](https://en.wikipedia.org/wiki/Chaos_engineering).

The architecture diagram below for a photo management service, on a recent project, demonstrates just how powerful Serverless can be. The service allows end-users to take, upload and manage maintenance photos of the organisation's physical equipment in the field. To deliver this, nothing more beyond CloudFormation scripts and Lambda code was needed.

<img style="display: block; margin-left: auto; margin-right: auto;" alt="photo management service" src="{{ site.url }}/img/bandwagonless/photo-app.png"/>

**Link of Interest:** [6 things I’ve learned in my first 6 months using serverless](https://read.acloud.guru/six-months-of-serverless-lessons-learned-f6da86a73526)

## Wrapping Up

For years now the phrase “start-ups are coming to eat your lunch” has been shouted from all corners of the Internet. This warning hasn’t changed, but what has is the extremely low barrier of entry to eat it. A few years ago, start-ups were still paying for virtual worlds that mirrored the physical; EC2 servers, VPC networking, relational databases designed just like on premise, VPN links back to data centres, etc. Dedicated people were also required (and paid) to build, manage and operate all these things.

Today with serverless, entire development-to-production environments can be scripted and deployed by a single developer. The literal cost? A few cents at most. In fact, your time spent reading this post has probably cost more to the company you work for than the yearly operating costs of the serverless systems I’ve worked on.

Serverless is a relentless freight train building that is quickly building up momentum. You can either get onboard or be crushed. Join me in my next post where I discuss the new SDLC; Serverless Development Life Cycle.

**Link of Interest:** [Serverless and start-ups, the beginning of a beautiful friendship](https://aws.amazon.com/blogs/aws/serverless-and-startups/)
