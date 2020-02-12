---
layout: post
title: Practical Logging and Tracing Advice For Serverless Apps
date: 2020-03-10
tags: javascript tutorial serverless aws
author: Matthew Tyler
image: img/serverless-express.png
---

<center><img src="/img/serverless-express.png" /></center>
<br/>

# Introduction

# Logging

If you have ever written 'console.log' you will be familiar with logging. Printing out to the console is often one of the first things we learn, as part of the canonical 'hello world' example. Beyond that, most of us will write out to the console the moment we have an issue in our programs. That said, there are many things we can do to write better logs.

The first, and main thing we can do it to improve our logs is to introduce something popularly called 'structured logging'. This primarily means settling on a standard format in which to log. This is not just limited to the 'shape' of the output, which include lines in JSON or some other format, but typically includes what various attributes should be included the output.

A list of outputs that may be included for a typical structured logging line for a HTTP API, may include:

- The date-time of the log entry
- The log 'level', which may include,
- - Error,
- - Info,
- - Debug, etc.
- Header attributes, which may include,
- - Trace ID
- - User-Agent
- The route of the API
- The method of the API
- The actual log message

Be careful not to include secret material or personally identifiable information (PII) into your logs. There exist various ways to scramble this information to prevent running afoul of this, whilst still retaining enough information to be useful.

The more information and attributes you able to log, the more likely the information will be useful in some capacity. Events with a lot attributes are often referred to 'high cardinality events'.

# Tracing

Tracing is relatively new when compared to the now ancient practice of logging, and has come about as a means to understand actions rippling through distributed systems. In a monolith, the system has the context of the entire system at any one point in time. In a microservices architecture this is no longer true as the entire state of the system is spread throughout many different services. Simple logging will no longer help us in understanding an event or action as it propogates through the system.

Tracing offers a deceptively simple solution to this problem; begin by adding what is called a 'correlation identifier' or 'trace-id' to every request/response, and propogate this through the system. If one of your services makes a call to another service, it should continue to pass this identifier through to the other service, and so on and so forth. Each service should log this information correlation ID out in addition to everything else it was already logging. If the logs for all services are then centralized, it is possible to use the correlation ID to construct a complete map of how a request propogated through the system.

There exist many different standards/implementations for tracing, which have included OpenTracing, Jaegar, AWS X-Ray etc.

# When to Log vs When to Trace?

It can be very difficult to distinguish when you should be logging versus when you should be tracing. There is an incredible amount of overlap between the two, so I'm going to limit myself to discussing what to do within the context of a serverless application running on AWS. There will be a fair amount of 'opinion' going on here so of course, take everything with a grain of salt and be prepared to use your own judgement.

We'll start with tracing, because there is one clear advantage that is built in with X-Ray that you do not get with your own homegrown logging/tracing solutions, and this service integration. X-Ray is integrated with many different AWS services, and this gives you information in your traces that you will simply not be able to get any other way. An example of this is dynamodb service integration, in which the traces produced by the dynamodb service will include a lot of useful information about query performance. If you are building with serverless best practices which would include usage of as many managed services as possible, it would be senseless not to take advantage of this.

In addition, various AWS services will happily propogate your X-Ray trace IDs. This will enable you to create maps of request as they propogate through your services. Unfortunately, not every AWS service will propogate trace ID's (event bridge being a notable example), and creating traces across account boundaries is a labourious process. If you have separated your services into different accounts, you may find 'logging' your traces or using a third party tracing service is necessary.

Which brings me to logging. I generally prefer to keep logging pretty simple. I will generally:
- Log the request as soon it is received, to give me enough context as to what 'started' the particular transaction.
- Log any information that would indicate *branching* logic, if it occurs. e.g. if, else, case statements.
- Log any *unhandled* errors that might occur, e.g. those I allow to flow up to the handler. If something is caught and recovered from - I consider that branching logic.

Some of this will depend on how you structure your lambda code. I try to branch as little as feasibly possible, deferring to step functions for logic control/flow if it is required. As a result of this, it's not uncommon to see only two logging statements in my code. I usually do not bother to log a statement that indicates success of a particular function, unless I need this information for constructing metrics. A lot of services have reasonable support for constructing this without logs (like API Gateway), so this is not a step I would usually need to take.

# How to Log?

# How to Trace?

# Practical Example

# Conclusion