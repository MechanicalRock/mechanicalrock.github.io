---
layout: post
title: Strangler Pattern
date: 2020-05-04
tags: architecture patterns
author: Tim Myerscough
image: img/strangler-pattern/Strangler_fig_boulder_katandra.jpg
---

<center><a href="https://commons.wikimedia.org/wiki/File:Strangler_fig_boulder_katandra.jpg"> <img alt="strangler fig" src="/img/strangler-pattern/Strangler_fig_boulder_katandra.jpg" /></a></center>
<br/>

Technology is constantly evolving, so thinking in terms of the end goal is unrealistic.  Many companies struggle to keep up with the advances in technology.  If companies lag behind it increases commercial pressure from nimble new entrants, or competitors that can move faster.

Evolutionary architecture doesn't aim for an end state.  One tool for evolutionary architecture is the [Strangler Pattern](https://martinfowler.com/bliki/StranglerFigApplication.html).

# The Context
Consider migration to the cloud, [Infrastructure Modernisation](https://www.mechanicalrock.io/our-expertise/infrastructure-modernisation), or [Serverless technology](https://www.mechanicalrock.io/our-expertise/cloud-native-solutions).  How can we move faster whilst dealing with legacy systems?

You can't stop everything, down tools and re-write from scratch.  What's more, if you tried you would likely be caught out by the [Second System Effect](https://wiki.c2.com/?SecondSystemEffect).  "We can solve the issues of the past and re-write the system that took us 6+ years, in 12 months."  The reality?  18 months down the line: you are still building on the original system; the new system supports ~20% of the functionality of the original and technical debt accrued in the push deliver has turned your beautiful clean new architecture into a big ball of mud.

Instead, you need a mechanism to refactor and replace parts of a system whilst maintaining production availability.

# The solution

The strangler pattern provides an approach to controlled re-architecture.  

It is not intended to persist indefinitely.  Instead it provides a pathway to manage internal change whilst minimising the impact to external dependencies.  Once re-architecture has been completed, a key step is the removal of the strangler from your system to simplify and move forward.

![Strangler Pattern](/img/strangler-pattern/strangler-pattern.png)

**Stage 1**: Identify the system boundary you want to re-architect.

**Stage 2**: Create a [facade](https://en.wikipedia.org/wiki/Facade_pattern).

* The facade ensures clients of the system are unaffected by the re-architecture activity and should therefore match an existing system API.
* The API for the new service should be carefully designed to ensure backward compatibility with the legacy API.  If you want to make breaking changes to the API for the new service, that should be performed once re-architecture has been completed.

**Stage 3**: Re-architect.

* Implement your new service, wiring it in to the strangler facade.
* Dark launch the new service: tee traffic between the new and legacy implementations.
    * Return responses from the legacy implementation.  
    * Capture, or discard, responses from the new implementation.  This enables you to monitor the behaviour of the new implementation to ensure it is fit for purpose.
* Continuous deployment is also a good option.  Deploy partial implementations of the new service, whilst development is still in progress, to gain confidence and mitigate risk without compromising system behaviour.

**Stage 4**: Cutover.
* Once you are confident that the new implementation meets your needs, cutover production traffic so requests and responses are served from the new implementation.
* Retain the legacy implementation to allow for easy rollback if required.

**Stage 5**: Clean up the mess.
* Once the new system is established delete the legacy code that has been replaced.

**Stage 6**: Migrate clients to the new API and remove the strangler facade
* This is likely to require breaking changes to clients, and should be managed accordingly.
* To manage the transition, if you have a large number of clients, expose the new API whilst maintaining the strangler facade.  
    * Monitor usage of the strangler facade and proactively engage with clients to help them migrate.  
    * Once the strangler facade is no longer being used, it can be safely removed.

# Considerations

* Break up the system based on new service boundaries or integration layers.
* Removal of the strangler facade, and any unused legacy code is an important step to simplify the overall solution.
* Adequate monitoring and observability is required to validate the new service is fit for purpose.

# Case Study: Infrastructure Modernisation

The strangler pattern doesn't just apply to software architecture, but can be used as part of your cloud migration journey.

We helped one client replatform from an on-premise application servers to containers running on AWS Fargate.  The application consisted of a decoupled, event driven, architecture.

To manage the transition, each service was planned for migration in sequence.  The messaging middleware provided a natural integration point for the strangler facade.  In order to prevent message pollution from migrated services, a [message relay](https://www.enterpriseintegrationpatterns.com/patterns/conversation/Relay.html), simulating a [data diode](https://en.wikipedia.org/wiki/Unidirectional_network), was used to route messages into AWS for analysis without the risk of responses corrupting application state.

![case study architecture](/img/strangler-pattern/strangler-pattern-cs-1.png)

The strangler pattern enabled us to migrate and observe each service individually, helping to de-risk the move. 

# Case Study: Monolith to Microservices

A more common use case for the strangler pattern is re-architecting a monolith legacy application.

We helped to plan the re-architecture of a legacy monolith application to a microservice, event-sourced architecture.  The legacy application was a core business application, linked to revenue and developed over many years.  Halting feature delivery was not an option.

Having identified a target architecture of around 30 services, with a migration plan for each, the strangler pattern provided the ability to manage the transition and test in production.

<center>
<img alt="case study architecture" src="/img/strangler-pattern/microservices.png" />
</center>

<br>

The strangler facade was designed to match the existing legacy interface.  In the long term it wouldn't be fit for purpose, or fully realise the benefits of the re-architecture.  But for the purposes of the migration, it isolated the amount of change required.  API re-design and migration was planned as a subsequent activity.  For legacy requests, the facade provided a direct pass through and response.  For requests routed to the re-factored service, the facade used the adapter pattern to translate the request/response to the new service API.

Using the strangler pattern, the team were able to effectively begin a complete re-architecture of their legacy application, whilst following continuous delivery for both the legacy and new re-architected microservices.  Dark-launching the new microservices, utilising [wire taps](https://www.enterpriseintegrationpatterns.com/patterns/messaging/WireTap.html) incorporated into the strangler facade meant the whole process could be de-risked by testing in production, without any impact to end users.


## Conclusion

The strangler pattern, particularly when paired with complementing patterns such as wire-tap, provides a low-risk mechanism to enable large scale refactoring.  It can be applied in a variety of situations where re-architecture is required.  

During the application of the strangler pattern some tradeoffs may be required.  This should be accepted: the strangler pattern is a means to an end - to take you from point A to B in a controlled manner.  Removal of the strangler facade, followed by further evolution should be expected.

In some circumstances the strangler pattern is overkill.  When breaking up a monolith, if clear APIs are already available, a "slash and burn" technique is simpler: duplicate the code, establish deployment boundaries and then delete unused code.

Where your system already has support for migration patterns such as versioned APIs and multi-version deployment flexibility then the strangler pattern is not required: planning for continual redesign and evolutionary architecture is a better overall approach.

If any of the above resonates with you, please [get in touch](https://mechanicalrock.io/contact), and lets see how we can help.