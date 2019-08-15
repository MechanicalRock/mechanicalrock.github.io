---
layout: post
title:  "Technical Debt"
date:   2019-08-05
tags: aws cognito oidc saml2 sso azure
author: Matt Tyler
image:
---

> Debt . . . . that peculiar nexus where money, narrative or story, and religious belief intersect, often with explosive force. - Margaret Atwood

Technical debt is an infamous subject in software development. The common understanding is that we accrue it by some series of faustian pacts; short-cuts are taken in order to deliver a feature sooner, with the underlying assumption that additional features will take longer to complete. A development team that continues to accrue technical debt will eventually find time taken to deliver the next feature will begin to approach infinity. In defiance of what is an obvious problem to the average developer, business stakeholders are often loathe to address it. Technical debt is unyielding to measure and containment due to it being a vague concept. If developers wish redress from technical debt, a better way must be found to disclose and appraise the value.

There is a long list of potential consequences for allowing the unfettered accrual of technical debt. A reduction in the ability to deliver features (usually referred to as 'velocity') is chief among them. Knowing the consequences of even the smallest revision to the system is difficult. Minor changes accord ample opportunity to observe the butterfly effect. At the core of this is understanding. A lack of understanding has consequences beyond knowing how to safely modify the system. It handicaps our ability to prevent outages. When those outages occur (and they will), our ignorance will frustrate any attempts at triage.

> i have a theory, which is that we struggle to get the time allocated to pay down technical debt (or improve deploys, etc) because to biz types we basically sound like the underpants gnomes. step 1 ... pay down technical debt. step 2 ... step 3 .. PROFIT - Charity Majors, CTO @ Honeycomb.io

Pursuading stakeholders to pay down technical debt is fraught with difficulty. Requesting to pay down technical debt is akin to asking them to trade away something they can confidently say has some value, for a loose promise that if and when they ask for something else, it will be easier to deliver. It is little wonder that most technical debt doomsaying fails to convince anyone, notably in the low-trust terrain that forms the modern enterprise. The benefits of paying down technical debt are often presented in a nebulous way, which is in contrast to the concrete nature of getting a feature out to market sooner. Technical debt may be a murky concept, but that does not mean that the benefits of paying it down are. If we want technical debt to be taken in earnest, we need to get better at gauging the effects and presenting a case for removal that has discernable business benefit.

It is impossible to measure the intangible technical debt, but this property does not always extend to its effects. We can find another measurement (or more) that can act as a suitable proxy. This is not too dissimilar to maintenance practices in heavy industry. You can never know for certain when a piece of equipment is going to fail, but you can measure how well maintenance crews are adhering to a planned maintenance schedule. In most cases this is a reasonable indication of equipment health*. What measures could we identify that could act as reasonable proxies for the amount of technical debt across one or more software systems?

I believe a suitable proxy for technical debt can be found in existing literature on software delivery. The State of DevOps Report produced by DevOps Research and Assessment (hereby refered to as "the DORA Report") is compiled annually and details the habits of high performing software teams. It is one of the most rigourous studies on software development, produced from surveying and observing hundreds of teams across the world. If we are to come upon a satisfactory measure of technical debt, it would likely be in the DORA report. The report distinguishes two key measures of software delivery performance; throughput and stability. Throughput is measured via deployment frequency and lead time for changes. Stability is measured via time to restore a service and the change failure rate. I believe that change lead time and time to restore service are useful signals of the level of technical debt a project has acrued. Both of these marry well with the effects of technical debt discussed earlier, which included decreased velocity and increasingly risky changes.* Both of these measures are also difficult to game.*

TODO: Why is change lead time a good measure

TODO: Why is MTTR a good measure

This raises an interesting question to me; if software requires no additional features, and is never in need of repair, is it free of technical debt? Imagine two bodies of work. One has the former traits, along with the reputation for having been terrible to work with by the authors. The other is a more mediocre example of software development, currently in active development and incurring under 5 hours of downtime per year. Which suggests the lesser liability? If I fixate on the numbers in the shadow of our prior definition, I would be led to say the first system has less technical debt. But I guarantee that many would argue in favour of the second. There is an element of potential within technical debt; the absolute zero of which only occurs when the last change to be made is to turn it off.

Waiting for a situation to become untenable is no-ones ideal scenario but we can find ways to mitigate the effects. A development team should be able to reach a consensus as to what are acceptable limits to change-lead-time and MTTR. If these limits are exceeded, it should be acceptable for the development team to focus on reducing them until they are within a tolerable range. The Site Reliability Engineering book offers a similar concept called 'Error budgets'. Specialist Engineers are deployed to increase the reliability of critical services that have often been developed by other business units. These engineers assume on-call duties for the service - provided that the service meets a minimum standard of stability. If this minimum standard is breached the engineers are within their rights to refuse support until the system can meet it. A development team could enter into a similar contract to relieve technical debt.

TODO: Another strategy to contain technical debt presides within Conways Law

TODO: Reduce technical debt via interface

TODO: Image of communication links / Image

> If I owe you a pound, I have a problem; but if I owe you a million, the problem is yours. - John Maynard Keynes

TODO: Is technical debt even a useful to talk about?

TODO: Good Debt vs Bad Debt

TODO: Examples of Good Debt

> Blessed are the young, for they shall inherit the national debt. - Herbet Hoover

TODO: Conclusion


TODO: References