---
layout: post
title: Serverless Express API - Logging & Tracing
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

It can be very difficult to distinguish when you should logging versus when you should be tracing.

# How to Log?

# How to Trace?

# Conclusion