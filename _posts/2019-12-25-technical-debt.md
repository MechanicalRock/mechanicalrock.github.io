---
layout: post
title:  "Technical Debt"
date:   2019-08-05
tags: debt devops dora 
author: Matt Tyler
image:
---

> Debt . . . . that peculiar nexus where money, narrative or story, and religious belief intersect, often with explosive force. - Margaret Atwood

Technical debt is an infamous subject in software development. The common understanding is that we accrue it by some series of faustian pacts; short-cuts are taken in order to deliver a feature sooner, with the underlying assumption that additional features will take longer to complete. A development team that continues to accrue technical debt will eventually find time taken to deliver the next feature will begin to approach infinity. In defiance of what is an obvious problem to the average developer, business stakeholders are often loathe to address it. Technical debt is unyielding to measure and containment due to it being a vague concept. If developers wish relief from technical debt, a better way must be found to describe the cost in real terms.

There is a long list of potential consequences for allowing the unfettered accrual of technical debt. A reduction in the ability to deliver features (usually referred to as 'velocity') is chief among them. Knowing the consequences of even the smallest revision to the system is difficult. Minor changes accord ample opportunity to observe the butterfly effect. At the core of this is understanding. A lack of understanding has consequences beyond knowing how to safely modify the system. It handicaps our ability to prevent outages. When those outages occur (and they will), our ignorance will frustrate any attempts at triage.

> i have a theory, which is that we struggle to get the time allocated to pay down technical debt (or improve deploys, etc) because to biz types we basically sound like the underpants gnomes. step 1 ... pay down technical debt. step 2 ... step 3 .. PROFIT - Charity Majors, CTO @ Honeycomb.io

Persuading stakeholders to pay down technical debt is fraught with difficulty. Requesting to pay down technical debt is akin to asking them to trade something they confidently reason has some value, for a loose promise that if and when they ask for something else later, it may be easier to deliver. It is little wonder that most technical debt doomsaying fails to convince anyone, notably in the low-trust terrain that forms the modern enterprise. The benefits of paying down technical debt are often presented in a nebulous way, which is in contrast to the concrete nature of getting a feature out to market sooner. Technical debt may be a murky concept, but that does not mean that the benefits of paying it down are. If we want technical debt to be taken in earnest, we need to get better at gauging the effects and presenting a case for removal that has discernable benefit.

> If I owe you a pound, I have a problem; but if I owe you a million, the problem is yours. - John Maynard Keynes

TODO: Putting a price on technical debt may be difficult but that doesn't make it unimportant

It is impossible to measure the intangible technical debt, but this property does not always extend to its effects. We can find another measurement (or more) that can act as a suitable proxy. This is not dissimilar to maintenance practices in heavy industry. You can never know for certain when a piece of equipment is going to fail, but you can measure how well maintenance crews are adhering to a planned maintenance schedule. In most cases this is a reasonable indication of equipment health*. What measures could we identify that could act as reasonable proxies for the amount of technical debt across one or more software systems?

If we are to find a substitute for technical debt we first need to figure out what attributes it would have. For a measure to be beneficial it must be difficult to exploit for individual gain at the expense of the business. Software developers can be brazen creatures. What may be viewed as cheating by the general populace, a developer may deem as a clever use of mechanics. Any metrics we choose should have as few side effects as possible. Ideally such such a metric should have a positive correlation with software best practices. Reducing technical debt via some proxy (whatever form that takes) is not practical if it conflicts with good hygiene (e.g. writing tests).

I believe a suitable proxy for technical debt can be found in existing literature on software delivery. The State of DevOps Report (Forsgren, N. et al. 2018) produced by DevOps Research and Assessment (hereby refered to as "the DORA Report") is compiled annually and details the habits of high performing software teams. It is one of the most rigourous studies on software development, produced from surveying and observing hundreds of teams across the world. If we are to come upon a satisfactory measure of technical debt, it would likely be in the DORA report. The report distinguishes two key measures of software delivery performance; throughput and stability. Throughput is measured via deployment frequency and lead time for changes. Stability is measured via time to restore a service and the change failure rate. I believe that change lead time and time to restore service are useful signals of the level of technical debt a project has acrued. Both of these marry well with the effects of technical debt discussed earlier, which included decreased velocity and increasingly risky changes.*

TODO: Why is change lead time a good measure
$$$ terms

TODO: Why is MTTR a good measure
$$$ terms

This raises an interesting question to me; if software requires no additional features, and is never in need of repair, is it free of technical debt? Imagine two bodies of work. One has the former traits, along with the reputation for having been terrible to work with by the authors. The other is a more mediocre example of software development, currently in active development and incurring under 5 hours of downtime per year. Which suggests the lesser liability? If I fixate on the numbers in the shadow of our prior definition, I would be led to say the first system has less technical debt. But I guarantee that many would argue in favour of the second. There is an element of potential within technical debt; the absolute zero of which only occurs when the last change to be made is to turn it off.

Waiting for a situation to become untenable is no-ones ideal scenario but we can find ways to mitigate the effects. A development team should be able to reach a consensus as to what are acceptable limits to change-lead-time and MTTR. If these limits are exceeded, it should be acceptable for the development team to focus on reducing them until they are within a tolerable range. Beyer, B. et al. (2016) offer a similar concept called "Error budgets". Specialist engineers are deployed to increase the reliability of critical services that have often been developed by other business units. These engineers assume on-call duties for the service provided that the service meets a minimum standard of stability. If this minimum standard is breached the engineers are within their rights to refuse support until the system can meet it. A development team could enter into a similar contract to relieve technical debt.

As a body of software becomes larger it becomes difficult to maintain. This is aggravated by the inconvenient truth that software engineers are not tethered to their creations. They leave and new blood takes their place. New engineers need to understand the legacy left by the predecessors sans the education of having built the system in the first place. It is unreasonable to expect that a new engineer is going to be as effective as the seasoned veteran. We recognise nobody joins a new company with knowledge of its internal processes, politics and three-letter-acryonyms, and so we should expect the same of its software systems. Reducing the amount of learning required to be effective is a suitable means to ensuring that turnover does not effect the mean-time-to-repair and change-lead-time. This also provides the freedom required for specialisation.

TODO: Image of communication links / Image

Specialisation is commonly exploited. For a team of twenty engineers, sharing responsibility across twenty systems may feel like working on a crowded train. Drawing boundaries within the system and assigning responsibility for a particular subset of the group is how we commonly manage this. This works well provided that each smaller team still remains large enough to manage the burden of the subsystem. All we have actually done is (hopefully) distribute our engineers efficiently. Be aware that this redistribution occurs whether your team is working on microservices or a monolith. Any attempt to fight this is akin to trying to nail the wind to the ground, so you would be better off learning how to live with it. Managing your domain boundaries can be an effective way to reduce mean-time-to-repair and change-lead-time. This may not remove technical debt, but managing it becomes easier.

Experience is another means by which we reduce potential exposure to technical debt through specialisation. A team is more effective at building a system if it includes members that have built such a system before, and/or have experience with the domain. As a society we have recognised this fact with increased responsiblity and compensation for accomplished individuals. The company pays more in upfront labour costs for the accomplished individual, expecting that the chance of success has increased; while there is still an element of risk and debt involved, a return-on-investment will be expected.

Outsourcing to a third party is a close relative to dampening the effects of technical debt through smaller teams and specialisation. Cloud computing is the leading trend in outsourcing today. Hosting, databases, queues, and more are just a HTTP request away. The architectures that were once the territory of companies with a cast of thousands are now within the reach of a trio of computer science dropouts. Technical debt is still amassed when relying on services from a cloud provider: there is always the risk a service will be deprecated, or that it will be modified, or that it will no longer be suitable for our needs. But this is significantly smaller than the debt accrued when hosting the service ourselves. We would become responsible for the implementation, for maintenance, for the politics of prioritising new features among various internal stakeholders, and be held accountable for when the service inevitably fails. This a collosal amount of nonsense to suffer for a service that does not grant competitive advantage. If technical debt is inevitable (and I believe it is), I would rather acquire it in service of providing functions that are critical to business goals.

> Debt certainly isn't always a bad thing. A mortgage can help you afford a home. Student loans can be a necessity in getting a good job. Both are investments worth making, and both come with fairly low interest rates. - Jean Chatzky

Not all debt in life is necessarily bad and the same can be said of technical debt. Debt in service of an education has historically proven to be a sensible decision, as it opens up opportunities for returns that would not have been possible without it. A company that has never been profitable is  probably better off concentrating on becoming profitable then obsessing over their software architecture. Taking upon some debt in service of this goal is worthwhile. The caveat is this must be a conscious decision. It is unwise to take out a loan out if you will be unable to get a return-on-investment. Yes, there is always some level of uncertainty in a new venture and value is often found in the unknown, but taking no steps towards due-diligence is waving a white flag to negligence.

If technical debt can't be measured in its own units, must be informed by other metrics, and can be both good or bad: is it even worth talking about? It probably isn't helpful if you are fixated with tanglible outputs. Technical debt could function as a term to categorise team performance when restricted to a particular system, but why not just use "Team Performance"?. The term "technical debt" is useful as a barometer of team morale. Common usage is that of a perjorative, and so it signals how a team feels about the work it is producing. If discussions about technical debt are common in your team, it may be a good time to have a conversation about how the team feels about the trade-offs it is making. Are they the right trade-offs? Does the team feel valued? Does the team feel they are empowered and trusted to make the best decisions they can? Many studies have indicated that teams do their best when they have a sense of purpose and are empowered with the appropriate autonomy. If endless discussions about technical debt are becoming the main event at your daily standup and retrospectives, it may be a sign that there underlying issues regarding ownership that need to be addressed.

TODO: Find a good reference regarding autonomy and purpose

> Blessed are the young, for they shall inherit the national debt. - Herbet Hoover

TODO: Conclusion
proxy measures vs technical debt
the right measures
summaries realistic strategies for dealing with it
morale

References

[1] Forsgren, N., Humble, J. and Kim G. (2018) *Accelerate: State of DevOps: Strategies for a New Economy*. DevOps Research & Assessment.

[2] Beyer, B., Jones, C., Petoff, J. and Murphy, N. (2016) *Site Reliability Engineering*. O'Reilly Media.
