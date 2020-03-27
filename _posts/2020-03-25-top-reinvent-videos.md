---
layout: post
title: Re:Invent Yourself and Your Company With Serverless
date: 2020-03-25
tags: serverless aws security reinvent
author: Matthew Tyler
image: img/reinvent.png
---

<center><img src="/img/reinvent.png" /></center>
<br/>

# Introduction

I became a father for the first time recently. Turns out your hands are pretty much full for a lot of the time, rocking an upset infant back-and-forth in an attempt to get them to settle. Watching all the re:invent content I wasn't able to attend when I was at the conference seemed like a good way to fill in the time. I thought I'd put together an expansive list of my favourite videos from the last couple two re:invents. These sessions run a bit of a gamut; some are what I consider base-line knowledge, some are advanced use-cases, some are just interesting. Generally, they focus around the serverless ecosystem and topics that I think developers needs to know to become expert serverless practictioners.

<br/>
# API & Mobile

#### [(SVS402) Building APIs from front to back](https://www.youtube.com/watch?v=cc_pKfDOH2E)

This is a great presentation by Eric Johnson, in which he builds out a simple application using "serverless-first" features in API Gateway. It's a great example of how you can build an API without writing lambda functions.

#### [(SVS212) I didn't know Amazon API Gateway did that](https://www.youtube.com/watch?v=yfJZc3sJZ8E)

Once again from Eric Johnson, this goes over a bunch of features that API Gateway has that don't always see a lot of use from people new to serverless. It's a thorough overview of the product - so if you have only ever used API Gateway by proxy (e.g. through Serverless Framework) it's worth a watch.

#### [(NET310) Building serverless micro-frontends at the edge](https://www.youtube.com/watch?v=fT-5RHTtFNg)

This goes over CloudFront and Lambda@Edge, focusing on delivering content closest to users. For the longest time, this has been the only "edge-compute" functionality in AWS, but last year we saw an increasing number of releases around bring AWS closer to users. I'm referring to Outposts, Wavelength, and Local Zones which were all released at re:invent 2019. It's a good time to become more familiar with edge concepts, as it is probably going to become increasingly important in mobile and IoT applications.

#### [(MOB402) Data-driven mobile and web apps](https://www.youtube.com/watch?v=KcYl6_We0EU&t=1259s)

This is the sessions that contains information on Amplify Datastore. Amplify Datastore is Amazon's approach to handling offline sync for mobile applications, built into the Amplify Framework. It's a very flexible approach that should be ultimately should see some interesting things being built with it. Offline sync is particularly important when using mobile applications in remote areas, or places with unreliable network connections.

#### [(MOB306) Amplifying fullstack serverless apps with AWS AppSync](https://www.youtube.com/watch?v=QqL4Yx2nP98)

This is a good overview of what is capable with AppSync - a managed graphQL service. It's great for federating from multiple data sources, and this can help to accelerate development of web and mobile applications.

#### [(MOB308) Production-grade full-stack apps with AWS Amplify](https://www.youtube.com/watch?v=DcrtvgaVdCU)

Amplify is a framework for building web and mobile applications that is tightly integrated with the AWS ecosystem. In the future I imagine most application development will be frontend development connected to specialized managed services. Amplify is the harbinger of that time to come, so come take a look at what the future is going to look like.

#### [(SVS341) An in-depth tour of AWS SAM](https://www.youtube.com/watch?v=VG_nEWsiiGw)

AWS SAM is my favourite framework for serverless application development, and this is a decent introduction to it.

#### [(DOP402) Deep dive into AWS Cloud Development Kit](https://www.youtube.com/watch?v=9As_ZIjUGmY)

Of course, when things start to get too complicated with SAM, I find the AWS CDK is the cure for it.

<br/>
# Serverless Transformation

#### [(ARC373) Amazon.com: Reducing time to market & TCO using serverless](https://www.youtube.com/watch?v=zkG3S7dTMSU)

If you need to convince business leaders on the value of serverless, this is the presentation for you.

#### [(SVS320) The serverless journey of shop.LEGO.com](https://www.youtube.com/watch?v=20KBtJOxUpw)

Sheen Brisals talks about the experience of LEGO's move to serverless. It's cool to learn how larger enterprises have been able to use serverless to deliver better experiences. He was also on [Jeremy Daly's Serverless Chats podcast](https://www.serverlesschats.com/20) not too long ago.

#### [(SVS242) Selecting your first serverless pilot](https://www.youtube.com/watch?v=y-E4CUBmhW8)

The first step in any organization moving to serverless is quite simple: Build Something! But what? This presentation gives some ideas on selecting an appropriate project to build serverless-ly, so you can maximise your learning and chance of success.

#### [(GPSBUS210) Accelerate business innovation with serverless applications](https://www.youtube.com/watch?v=FMwbaDsv8qU)

If you need to convince business leaders on the value of serverless, this is the other presentation for you.

#### [(SVS226) From prototype to org-wide serverless adoption: Key considerations](https://www.youtube.com/watch?v=q1jpS_XhZgc)

You've had your first successful production pilot, now what do you do? How can you get your organization to adopt serverless on a wider scale? A great overview of the technical considerations and cultural changes that teams will need to adjust to in order succeed with serverless.

<br/>
# Serverless Backend Architecture

#### [(SVS401) Optimizing your serverless applications](https://www.youtube.com/watch?v=5rMiq-jw1Ig)

Chris Munns takes you on a journey, explaining many of the best practices out there for building serverless applications. This is required viewing - it'll bring you up to speed with the current best practices for serverless circa 2019.

#### [(SVS308) Moving to event-driven architectures](https://www.youtube.com/watch?v=h46IquqjF3E)

A great presentation from Tim Bray. Event-driven architecture is the only way to deliver scalable applications, and happens to combine nicely with other approaches like Behaviour Drive Development and Domain Driven Design.

#### [(API320) Building event-driven applications with Amazon EventBridge](https://www.youtube.com/watch?v=Hih-bF8qYgU)

Amazon EventBridge is up there as one of my favourite services, as it is a powerful tool for building decoupled backend services. This allows me to add new services and improve existing ones in an incremental manner, helping me to deliver software sooner.

#### [(SVS406) Asynchronous-processing best practices with AWS Lambda](https://www.youtube.com/watch?v=QNnMpoD4RHM)

Once you've moved to event-driven architectures, you are in a position to take advantage of asynchronous processing. Done well, this enables you to build a considerable amount of resiliency into your applications.

#### [(API304) Scalable serverless event-driven applications using Amazon SQS and Lambda](https://www.youtube.com/watch?v=2rikdPIFc_Q)

Queues form the foundation of asynchronous processing, so understanding how to use queues well is critical.

#### [(ARC307) Serverless architectural patterns and best practice](https://www.youtube.com/watch?v=9IYpGTS7Jy0)

Heitor Lessa goes over the common patterns that many of us see frequently implemented in serverless applications. A useful presentation to watch as it may have a solution to a problem you are currently experiencing.

#### [(ARC349) Beyond five 9's: Lessons from our highest available data planes](https://www.youtube.com/watch?v=2L1S0zfnIzo) | [(STG331) Beyond 11 9's: Lessons from Amazon S3 culture of durability](https://www.youtube.com/watch?v=DzRyrvUF-C0)

Two cool videos on how Amazon builds ultra-reliable services. Less useful for building a service on a technical level, but excellent advice on how manage development and operational teams to deliver critical services.

#### [(SVS405) A serverless journey: AWS Lambda under the hood](https://www.youtube.com/watch?v=xmacMfbrG28)

Want to learn how AWS Lambda actually works? Watch this video.

<br/>
# Data Management

#### [(CMY304) Data modeling with Amazon DynamoDB](https://www.youtube.com/watch?v=DIQVJqiSUkE)

Most of us are more familiar with relational databases like MySQL or Postgres, so using a NoSQL solution like DynamoDB can be a bit of an adjustment. Here Alex DeBrie gives a gentle introduction to working with NoSQL databases.

#### [(DAT403) Amazon DynamoDB deep dive: Advanced design patterns](https://www.youtube.com/watch?v=6yqfmXiZTlM&t=2s)

Rick Houlihan is a database deity. You'll be studying this presentation for years, and it's worth the price of a re:invent ticket alone. If you want to know how to something in DynamoDB, chances are it is in this presentation. If you want to build high performance applications with virtually infinite scalability, throw your RDBMS and hook your brain up to this.

#### [(DAT336) Aurora Serverless: Scalable, cost-effective application deployment](https://www.youtube.com/watch?v=I0uHo4xAIxg)

Of course, if your not ready for DynamoDB or it doesn't fit your use-case, you have a good serverless option in Aurora - a serverless RDBMS.

#### [(STG302) Best practices for Amazon S3](https://www.youtube.com/watch?v=N_3IaOVcIO0)

Amazon S3 is such a critical service to AWS and the rest of the internet. It might just be plain old storage, but it's ubiqituity in various serverless applictions make it an important service to learn.

#### [(ANT307) Deep dive into Amazon Athena](https://www.youtube.com/watch?v=tzoXRRCVmIQ)

Serverless analytics is a growth area. Athena is such a cool tool - dump some data into S3 and analyze it. It couldn't be simpler. The whole service is basically dark margic.

<br/>
# CI/CD

#### [(DOP302) Best Practices for authoring AWS CloudFormation](https://www.youtube.com/watch?v=bJHHQM7GGro)

If you are doing any work with AWS, you have probably written a CloudFormation template or two. A lot of people love to complain about CloudFormation, but I still think it is a pretty great tool once you get used to it. One of the challenges to templates is understanding all the features available in authoring templates. This presentation does a good job of showing them off.

#### [(SVS336) CI/CD for serverless applications](https://www.youtube.com/watch?v=jUXiOPTX9S4)

If you want to make a rock-solid service, you need rock-solid CI/CD. Learn how to do it for serverless applications.

#### [(DEV319) Continuous integration best practices](https://www.youtube.com/watch?v=77HvSGyBVdU&t=181s)

The first step to CI/CD nirvana is having good CI. Learn how to get it right the first time so you can create tight, effective feedback loops that will help enable to write better software, faster.

#### [(DEV317) Advanced continuous delivery best practices](https://www.youtube.com/watch?v=Jnl29J3RJQ4&t=227s)

Continuous Delivery is a subject area that doesn't get nearly as much attention as CI. Why? Because it's hard.

#### [(DOP404) Amazon's approach to high availability deployment](https://www.youtube.com/watch?v=bCgD2bX1LI4)

Now you have learned the best practices, come see how Amazon actually does it. There is a lot of useful information in this presentation that goes along way to explaining why AWS CodePipeline is the way it is.

<br/>
# Security

#### [(SEC209) Getting Started with AWS Identity](https://www.youtube.com/watch?v=Zvz-qYYhvMk)

Given you are going to need to secure access to various services, your going to need to write some IAM policies. This is a good overview of the IAM service.

#### [(SEC316) Access Control Confidence: Right access to the right things](https://www.youtube.com/watch?v=XO4CALyzbVM&t=1167s)

A more in depth guide to IAM with various examples. It also covers 'Attribute-Based Access Control' which is going to become a more important method of authorization in the AWS ecosystem, as it allows for AWS to source attributes from external identity providers and use those to determine the right level of access. Contains traces of Pickles.

#### [(SVS310) Securing enterprise-grade serverless apps](https://www.youtube.com/watch?v=D2JyI7QV8c4)

A good review of different patterns for securing access to serverless applications. If you want to know what your various options are for securing your serverless API's, this a good one to review.

#### [(DOP310) Amazon's approach to security during development](https://www.youtube.com/watch?v=NeR7FhHqDGQ)

Want to learn how AWS handles security? Hint: it's everyones responsibility.

Starting out with Serverless? [Contact Mechanical Rock to Get Started!](https://www.mechanicalrock.io/lets-get-started)