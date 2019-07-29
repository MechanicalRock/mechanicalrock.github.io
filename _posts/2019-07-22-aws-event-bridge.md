---
layout: post
title: AWS Annouces Event Bridge
date: 2019-07-26
tags: aws event-bridge
author: JK Gunnink
---

Earlier this month Amazon Web Services introduced a new service to their suite called EventBridge,
and amongst the community it's created quite a buzz. [Some are even claiming it to be the biggest
thing since Lambda](https://www.trek10.com/blog/amazon-eventbridge/).

## What is it?

According to the EventBridge landing page:

> Amazon EventBridge is a serverless event bus that makes it easy to connect applications together
> using data from your own applications, Software-as-a-Service (SaaS) applications, and AWS
> services. EventBridge delivers a stream of real-time data from event sources, such as Zendesk,
> Datadog, or Pagerduty, and routes that data to targets like AWS Lambda. You can set up routing
> rules to determine where to send your data to build application architectures that react in real
> time to all of your data sources. EventBridge makes it easy to build event-driven applications
> because it takes care of event ingestion and delivery, security, authorization, and error handling
> for you.

Building on the CloudWatch service which can be used as an event trigger, EventBridge allows events
from AWS and external services to be captured by EventBridge and forwarded on to a destination that
fits the event's use case based on it's contents.

Some architectures and patterns come to mind when dealing with events, one such example is the
[rapids, rivers and ponds architecture](https://www.youtube.com/watch?v=Cmc4zBOb4OA). EventBridge
allows you to filter events from many sources, at potentially high volume (rapids), and based on the
event forward it through to the next service in it's lifecycle (rivers) before it finishes at it's
desitination. As a comparison, a current approach would be to use SNS, with SNS Filters. To
integrate with CloudWatch Events, it requires an event dispatcher to forward events from CloudWatch
to SNS - which adds latency and additional cost.

![Event Bridge Architecture]({{ site.url }}/img/eventbridge-arch.png)

As shown in the image above, an event is emitted from one of the three sources to event bridge.
Based on a series of filters and/or rules the event is forwared on to a number of potential targets
for handling.

A use-case which comes to mind when thinking about the potential application for EventBridge, is one
where an existing application has to make some kind of web-hook to respond to an event happening.
For example, let's say a developer has completed some work that a product manager was especially
keen to see done, and that manager was following the ticket. Previously, that work would fire off
some kind of webhook and a listening service (eg, API Gateway, Lambda) would have had to be
listening out for it, and process it in some way i.e. post a Slack message to a channel or send an
email off to relevant subscribed parties. With event bridge, that event being listened out for, and
based on the rules, eg (work completed, product owner following ticket, etc) the event makes it's
way through the rules and filter sets to its destination. Given that a single rule can route to
multiple targets, all of which are processed in parallel, and that rules allow different application
components to look for and process the events that are of interest to them, in our scenario,
multiple things can happen when our developer closes out that piece of work.

- Notify the build service to deploy a new version of the app
- Send an email to the product manager of the followed work
- Send a message to the team saying a new feature is ready for release
- ... the list is endless.

Like many AWS services, EventBridge is extremely cheap, and free if your events are AWS service
events. Even if you choose to integrate with a third party SaaS product or generate your own custom
events, it's still only \$1 per million events.

We've helped clients build many serverless systems that are event driven. If you think we can help
you, feel free to [contact us][contact-us] or [tweet us](https://twitter.com/mechanicalrock_) your
ideas for how you might use EventBridge.

[contact-us]: https://www.mechanicalrock.io/lets-get-started
