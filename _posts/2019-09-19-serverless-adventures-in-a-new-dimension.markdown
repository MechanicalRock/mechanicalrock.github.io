---
layout: post
title:  "Serverless: Adventures in a New Dimension"
date:   2019-09-19
tags: Serverless Cloud Native
author: Richard Forshaw
---

I have been exploring opportunities in Kuala Lumpur and Singapore for Mechanical Rock, and during this time it’s been clear that the area is further behind the adoption curve than Australia. Australia has the luxury of being populated with companies and developers with a good appetite for learning and implementing new technology. The Malaysia peninsular however is still in an ‘understanding’ phase.

So rather than sit and wait to catch up, I decided to deliver a bit of Cloud Native education, which had the benefit of allowing me to delve further into what makes these technologies such game changers.

## Into a New Dimension

The history of software development & delivery has a number of step changes which unlocked new business potential. This is usually coupled with the addition of a ‘new dimension’ in thinking.

Imaging you are living on a 2-D plane. You are walking along your 2D road one day and you come across an obstacle. Let’s call it a line. The next day you are walking down the same road and you come across the same thing. Another pesky line. But is it really?

![Life on a 2D plane](/img/serverless/2d.png "Life on a 2D plane")

To the rest of us living in a 3rd dimension, we can see that it’s not a line, it’s a box. But to you, without the perspective of the other dimension, it just looks the same as the thing you saw yesterday.

## Software Step Changes

Why is this important? Let’s take the internet for example. Before the internet, people bought their software from a shop. Software could be written slowly because the distribution chain was slow. But then the internet opened up a new dimension for people to distribute software. A small group of people who recognised the power of this new dimension started writing software in their houses and distributing it online. Suddenly, software could be distributed instantly and cheaply, value could be given to customers faster and customer feedback could even be translated into new features quicker.

![Level Up](/img/serverless/level_up.jpg "Level Up!")

The people who harnessed the power of this new dimension led the way into a new era and the old era pretty much became obsolete. Now most of the software we use everyday is downloaded from an app store.

Let’s look at another more relevant example. We all know that software ultimately has to run on a server somewhere. But Virtual Machines introduced a new dimension to computer hardware. No longer did you have to dedicate one physical machine to an application; suddenly you could run multiple machines on one physical one. The new virtual machines could be created almost instantly at zero cost, and were also disposable. There was no more waiting for hardware to be delivered, and hardware specifications turned into machine configuration. This new dimension brought forth repeatable configurations, cloud computing and containers, which is almost becoming the new norm.

## The Next Compute Dimension

![Next Dimension](/img/serverless/new_dimension.jpg "The Next Dimension")

The next step-change in web-based software delivery is already here, and has been here for a few years. That change is serverless computing, but as with many new things, it is not fully understood.

Why do I refer to it as the next dimension? Because there are many things that it brings that you can’t see without changing your perspective, along with a new way of thinking that is needed to unlock them.

### Total Hardware Abstraction
I define a serverless service as one which require no maintenance of servers in order to run it. Therefore there is no need to worry about hardware, or in fact anything underneath of the service that is running. This is one step beyond that of the ‘managed service’ where there is usually some kind of basic server configuration that is required, even if it is defining the size of a cluster.

Why is this important? Serverless services allow you to focus purely on functionality or configuration to suit your business purpose, thus allowing you to deliver business value faster.

### Total Elasticity
Serverless automatically scales up and down with request loading. In fact it takes the next step from auto-scaling VMs and containers because serverless services are elastic from zero. If there are no requests being made to your system then your system is genuinely not running, as opposed to your EC2 or container being 'idle'. And when it is not running you are not being charged for it.

### Request-Based
Being request-based brings with it a new dimension of thinking. No longer do you think about fitting your expected usage onto a given machine size, and optimising your code based on those constraints. Instead you think about the requests, which is a more natural unit of business currency, because that is what your customers do; they don’t book a number of CPU cycles on your system, they make requests to it.

### Cost-Thinking
For a service like AWS AppSync (A GraphQL interface to your data sources), you get a million requests for a measly $4. If you hosted your own REST API on a smallish EC2 (2GB t3 small) you would get 6 days of running, and you are still charged for when your EC2 is not doing anything. You might say ‘Well that’s not too bad', but remember that you still need a database, time to set it up, time to update and security patch it, time to implement monitoring etc etc. Not to mention having to solve problems like coping with traffic bursts.

### Accelerating Business Value
This is all great, but how do we know that this is not just a ‘new shiny’. The DevOps Research and Assessment (DORA) [“State of DevOps”](https://devops-research.com/2018/08/announcing-accelerate-state-of-devops-2018/) report rates companies into Low, Medium, High and now Elite performers, based on their software delivery practices and their business metrics. The report stated that if you are using Cloud Native technology to build software then you are 1.8x more likely to be in the ‘Elite’ performer category, which is shown to reflect on your business performance. And this amongst other things comes down to being able to deliver features quickly because you are able to focus all of your efforts on those features, rather than non-value-add maintenance activities such as maintaining, monitoring and patching servers.

## Not Just Lambda

![Not Just Lambda](/img/serverless/serverless_services.png "Not Just Lambda")

People I talk to often immediately equate ‘serverless’ with cloud functions such as ‘AWS Lambda’. While this is one of the AWS serverless offerings, it is only a small part of a very rich ecosystem. There is API Gateway to handle web requests, Cognito to handle your authentication, S3 and DynamoDB for storage. SQS for message queues. And CloudWatch and X-Ray for monitoring.

S3 and SQS you say? But they have been around for ages! Yes they have. And they are serverless. Do you need to manage any servers to use them?

### Not A Silver Bullet
As much as I am an advocate of serverless, I know that it is not the answer to everything. It is a great solution for applications which are event-driven with medium-to-high volume, sporadic and fairly short-lived requests. Which puts it at the forefront for web-based applications. For example A Cloud Guru built their entire Learning Management System using Serverless services, a business which now supports over a million worldwide users and whose infrastructure bill is only about AU$500/month.

If you are running heavy batch-based workloads, then there is better technology for you to use. But this is also key: platform and architecture are part of your tooling choices, and having an understanding of your needs and the options available to you will surely put you on the path to becoming an ‘Elite Performer’ yourself.


