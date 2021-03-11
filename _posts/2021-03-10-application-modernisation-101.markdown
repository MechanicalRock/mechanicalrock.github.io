---
layout: post
title: Application Modernisation 101
date: 2021-03-10
tags: application modernisation aws cloud
image: /img/blog/appmod101/spacex--p-KCm6xB9I-unsplash.jpeg
author: Anthony Jones
---

![Banner photo by SpaceX on Unsplash](/img/blog/appmod101/spacex--p-KCm6xB9I-unsplash.jpeg)

**It’s 2021.** Elon Musk is launching Teslas into space, and you’re still sitting in the same server room you were in 1989. Around you, other organisations are either all-in on cloud or flocking to it. Providers like AWS, GCP and Azure are posting double digit year on year growth figures, and yet, your core software and infrastructure is still running in an on premise data centre, with internal proponents touting concepts like ‘total control’, security and lower total cost of ownership (TCO) to justify maintaining the status quo. 

You are trailing so much legacy technology that half your systems are running on extended support, and then your IT department comes forward with an eye watering estimate for the next three - five years of hardware refresh. It’s not a question of whether to move to the cloud, the question is how.

When it comes to application modernisation, it’s often confusing knowing where to start; EC2, ECS, EKS, Lambda, Managed Services. For those not familiar with all the cloud TLAs (Three Letter Acronyms) it can be quite daunting and it’s not always clear what the tradeoffs are with each.

Broadly speaking, the options to look at when thinking of the shift to cloud can be categorised by the six R’s. 

Each has its advantages and disadvantages, but when making the decision around how to modernise your applications, there’s always almost a trade off between upfront cost, and total cost of ownership. One option is to replicate your data centre in the cloud, but these ‘lift and shift’ approaches offer very little gains in terms of total cost of ownership, with sometimes the ongoing costs being higher than running on prem. Let’s take a look at the 6 R’s, namely *Retain, Retire, Replace, Rehost, Replatform and Refactor*. The first three require very little effort, but should always be considered before you embark on any ‘Cloud Transformation’ journey. The last three require an increasing amount of upfront investment, but also lay the foundations to leverage all the benefits of cloud.

## Retain
Well, this isn’t application modernisation at all. But always ask yourself, “Is the way we’re doing it currently the best way for our current needs”. If the answer is, “Yes”, then why are you changing anything?

## Retire
Do you really need the application? Particularly in large organisations, or organisations that have experienced rapid growth, duplicate capabilities are often introduced into the mix. Do you have duplicated application capabilities and would you be best served consolidating those applications and retiring some applications? Not only are you reducing the amount of administration overhead, potentially there’s a reduction in licensing, training costs and data integration efforts.

## Replace/Repurchase
So it turns out that your unicorn application isn’t so niche after all, and there’s a SaaS provider that provides the same services. Why are you maintaining the application at all, when that effort could be put into core business? Perhaps simply purchasing the services from a SaaS provider is the best way forward. Just make sure you don’t lose needed capabilities and consider the consequences of potential lock in. 

## Rehost
Yes.. it’s lift and shift. Yes, it’s quick and dirty. This isn’t really application modernisation at all, it’s merely moving your applications from one place to another. It’s a super quick win where you can claim your applications have moved to the cloud, but you aren’t really going to see any of the benefits. You still need to manage the operating system patches and your own scalability and availability. Only consider this option if you’re considering sunset applications that will be obsolete or retired in a few years, or your data centre is closing down tomorrow and you need a stop-gap measure.

## Replatform
Replatforming your application requires strategic and selective migration of services to managed services offerings. This means undertaking tasks such as migration from databases running on on-prem servers to managed services like RDS and applications to container-based infrastructure. This is a solid approach that minimises application redevelopment but starts to benefit from the scalability, redundancy and fault tolerance capabilities of cloud based infrastructure. It does require more effort ($$$) than simple rehosting, however the total cost of ownership savings are significant.

## Refactor
There’s a couple of ways to tackle refactoring your application. This can range from adopting the [Strangler Pattern](/2020/05/04/strangler-pattern.html) and methodically replacing and rewriting parts of your application, through to complete wholesale rewrites. The aim with refactoring your application, will be to leverage Platform as a Service components of your chosen cloud provider to get the best resilience, scalability and performance. Refactoring your application to use serverless technologies will see great improvements in its efficiency, where you’re only paying for what you use, and are able to scale up effortlessly. Critics of this Cloud Native will often quote vendor lock-in as the major issue with this approach, and this is true - you will be tied to the platform provider’s implementation of particular services, however… this is also true of any software development project using any framework, whether cloud native or not. As with replatforming, refactoring requires significant effort and will often have the largest outlays of any of the application modernisation strategies, however it also provides the biggest cost savings in the long term, and positions the application in the best position for future maintenance, enhancement and scaling.

## Control and Security
We mentioned early on in the article two concerns that are sometimes raised when it comes to moving from on-prem, Control and Security. Application control often rears its head because of anecdotal stories that people have heard… “Move to the cloud and you no longer have control on where your applications run, or you can’t guarantee how much computing power your application will get”. This is simply untrue. 

I highly recommend anyone making decisions about cloud migration does the baseline course of one of the cloud providers, such as AWS Cloud Practitioner, or Microsoft Azure AZ-900. In these courses you’ll learn all about regions, compute and storage resources and how, if anything, you have more control over how your workloads are run. What you won’t need to worry about is hardware failure, refresh, maintenance etc. The cloud providers run at economies of scale you can never hope to achieve and will provide much better baseline services than any local data centre provider. You’ll also hear about cloud security and how the current best practices in the cloud world easily outstrip any physical, network or application level security practices you may already be running on-prem (and they have all the certifications such as IRAP, SOC, PCI-DSS etc to back it all up).

## Investment versus ROI
Regarding the tradeoff between initial investment and return, there’s a clear relationship:  
![More upfront = more return](/img/blog/appmod101/roi-graph.png)

It’s easy to see that embarking on a rehosting exercise of moving all your applications and services to VM’s in the cloud is a quick and cheap exercise, but as the graph shows, the costs with this approach won’t end when the instances are powered up. Overall, a one for one swap rarely works out cost effective, and none of the benefits of scalability, availability and resilience are gained. If you have the time, smart decision makers are opting for the long game, and really leveraging off the benefits of rearchitecting, refactoring and rebuilding for cloud native deployments.

## Pros and Cons



|                       |Rehost|Replatform|Refactor/Rebuild|
|-----------------------|------|----------|----------------|
|Upfront Cost|Low|Medium/High|High|
|Ongoing Cost|High|Medium|Low|
|Implementation Timeline|Short|Medium|Long|
|Complexity|Low|Medium|High|
|Scalability|Low|High|High|
|Fault Tolerance|Medium|High|High|
|Availability|Medium|High|High|
|Skills availability|High|Low|Medium|

** Please note, these categorisations are indicative and relative that depend completely on the Application/Workload. There are a multitude of exceptions to these rules of thumb.

## Conclusion
The landscape of digital infrastructure is changing - your challenge is to decide how to leverage it for the benefit of your organisation There’s no one right way to move your applications into 2021. The only failure would be to not make a decision at all. 

The approach you take will vary depending on your individual circumstances, your budget and your timeline. Fortunately, there is a spectrum of solutions available, each with their own pros and cons. The real benefits of cloud are only fully realised as you trend towards the refactor/rebuild end of the spectrum. Hopefully this article provides some insight as to what your options are. Stay tuned to our blog for an in-depth look into replatforming, coming soon.
 
If you've got an [Application Modernisation](https://www.mechanicalrock.io/our-expertise/application-modernisation) problem on your hands, have a look at [how we could help](https://www.mechanicalrock.io/our-expertise/application-modernisation).


<sup><span>Banner photo by <a href="https://unsplash.com/@spacex?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">SpaceX</a> on <a href="/s/photos/launch?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a></span></sup>