---
layout: post
title: Ten Tips from the DevOps Enterprise Summit
date: 2020-10-22
tags: devops
author: Nick Jenkins
image: img/blog/devops-enterprise-summit/does2020.png
---

Recently I had the pleasure of (virtually) attending the 2020 DevOps Enterprise Summit.

Normally hosted in Las Vegas by Gene Kim’s IT Revolution, the conference brings together speakers from all over the world to talk about how they are transforming their software development.

While there was an element of ra-ra corporate spin to many of the talks there were also a lot of insights from industry experts and practitioners (no one ever fails and one speaker even described COVID-19 as an ‘inspiring challenge’).

This post is an attempt to distil the best ten tips for a digital transformation from the learnings of those contributing to the conference. With over 90 sessions in three days it was no easy task to whittle the content down to something digestible but here is my attempt. I hope you enjoy it and learn something.

# 1. Learn to see the work

> Roman Pickl and Dr Manja Lohse, Elektrobit - “Are We Really Moving Faster? How Visualizing Flow Changed the Way We Work”

The automotive industry is undergoing disruptive change; driven by electrification, automated driving, and connectivity, transforming vehicles into a software-defined internet-of-things (IoT) device. Elektrobit (EB) is a global supplier of embedded and connected software products for the automotive industry and their software powers over 1 billion devices in more than 100 million vehicles.

Traditionally a full cycle of build and test took 24 hours which impacted developer morale and “felt like quicksand”. By applying the [3 ways of DevOps](https://itrevolution.com/the-three-ways-principles-underpinning-devops/) they were able to remove bottlenecks and reduce cycle times to 8 hours and eventually to minutes with developers getting feedback within minutes on every commit.

But it didn’t feel like they were delivering value faster.

So they lifted a play from the Toyota/Lean playbook by making the work visible through a series of ‘information radiators’ or dashboards which showed metrics like JIRA tickets, build times, failing tests and project metrics. From this came the revelation that improvements in the build process hadn’t led to improvements in bottom line company results and the reason was staring them in the face - the bottleneck had moved to testing.

Resolving this bottleneck led to another realisation - they were shipping more code but it was coming from ‘fix’ branches, rather than master. So they were slowing down, on average, as rework took over from shipping features. By throttling their work-in-progress, optimising their planning process and investing in test automation and emulation they’ve been able to halve their release cycle, finding the optimum balance of features and defect fixes. This was only possible because they could see the work that they were doing

# 2. Customer centricity doesn’t mean saying “yes” to everything

> Adam Furtado Chief of Platform, Kessel Run and Lauren Knausenberger, Deputy CIO, US Airforce - “The Air Force's Digital Journey in 12 Parsecs or Less”

The “Kessel Run” was an insurgent initiative to bring modern software development to the US Airforce, to create “a software company that could win wars”.

By deploying common and well trodden DevOps techniques to a pilot project they were able to deliver savings of US$200k/day in aircraft refueling within weeks and, by iterating on the problem, nearly US$13m of savings per month by the end a year.

Platform or service teams need a deep understanding of the larger business objectives they support. And being customer centric does not mean saying “yes” to everything - that leads to “an unconscionable amount of unplanned work” and an unsustainable amount of work in progress in the guise of making your customers happy.

By limiting the work in progress, focussing on the flow and developer productivity they have been able to extend the gains of pilot projects to their larger platforms. They also focus on the psychological safety in their working culture so engineers can contribute their skills and opinions to the goals of the organisation without fear of failure.

# 3. DevOps stops in production and not before

> Colin Wynd, Head of Real Time Payments, The Clearing House - “The Three Anti-Patterns of DevOps”

Colin defines DevOps succinctly as the “ability to change a line of code and get it to production that same day, with confidence.”

He defines three common anti-patterns for DevOps:

1. If your team is called DevOps then you’re probably not doing DevOps
2. You need to be doing some form of agile development to be able to do DevOps
3. You’re not doing DevOps if you’re not going to production

While the first two are easy to understand the third will probably cause some consternation. Typical reasons for this is either because automation stops at an early environment (with manual deployments to production) or because the teams aren’t integrated well and there is some manual ceremony required to reach production, like raising a ticket, clearing CAB or handing over to another team. In short, if your CI/CD stops before production, you are probably not doing DevOps.

If this is true for your organisation then you are either not going to reap the full benefit of DevOps or you are going to struggle with scaling your model across the enterprise.

# 4. Build credibility with your executive

> Ken Kennedy EVP of Technology and Product and Scott Prugh Chief Architect & SVP of Engineering, CSG International - “DevOps Lessons from Executive Leadership: Why DevOps Matters to Corporate Performance”

CSG International is a leading provider of revenue management, monetization, payments and customer engagement solutions to the telecommunications industry. They have \$980m in annual revenue and support more than 65 million subscribers worldwide.

They have been on a modernisation journey for a number of years and have had significant wins with DevOps, but key to this was executive support for their transformation.

To achieve this they build credibility by:

1. Operating with an economic mindset - articulating the hard cost savings or increase in revenue to show that you understand the commercial imperatives of the business.
2. Prioritising investments - focusing on those initiatives that deliver the most value in the shortest time.
3. Delivering on commitments - foster trust by delivering on your promises and don’t be afraid to trumpet the benefits of your successes to a wide audience.

# 5. Finance, friend or foe? Embrace them anyway.

> Maya Leibman, EVP and CIO, and Ross Clanton, Chief Architect, American Airlines - “DevOps: Approaching Cruising Altitude”

One of the first things that American tackled was the project approval process. Finance enforced cost control through a process that was effectively designed to make you give up. Some IT projects were even completed before they were approved.

By working together, Finance and IT profiled costs and came to the realisation that 2/3 of the costs were buried in running systems that didn’t really deliver major business benefits. In doing this IT persuaded Finance to allow them to experiment with reducing run costs in these systems on the proviso that they retained the savings to reinvest in systems of differentiation.

That eventually led to a new simplified funding process which allowed teams the autonomy to choose (or change) their approach, as long as they delivered the outcomes.

# 6. The developer is your friend in this fight, be theirs

> Dwayne Holmes, Google Cloud Certified Fellow, “How A Hotel Company Ran \$30B of Revenue In Containers”

Dwayne helped one of the world’s largest hotel companies (1.4m rooms, >\$20B in revenue) migrate thousands of their workloads to Kubernetes in five different cloud providers. Starting in 2016 they started to move workloads into Docker to be run by their own orchestration platform.

When Dwayne was put into an operations role he realised that the only way to revolutionise the organisation’s infrastructure was to offer the developers a seamless experience. Instead of forcing them to raise tickets against a service catalogue he offered them command line tools which integrated with pipelines to deploy their code into production. The reduced feedback loops and productivity boost meant that developers chose the container based option 100% of the time for new workloads.

This snowballed into a transformation initiative that migrated 90% of the company’s workload into containers in the cloud. But containers are not a magic bullet. It is just as possible to badly design and deploy containers as it is to deploy monolithic applications. You need to focus on container hygiene and service design to ensure your containers are portable and scalable and only then can you consider an orchestration system like Kubernetes.

# 7. Ops in DevOps is a strategic enabler

> Dave Mangot, Principal Mangoteque – “My Ops Team Can't Keep Up with My Dev Team, Creating Strategic Differentiation in Ops”

In consulting with Fortune 500 companies Dave regularly hears from frustrated clients that their Ops teams can’t keep up with their Dev teams. This is usually compounded with an antiquated view of Ops as a cost centre rather than a strategic enabler.

While working with one organisation who were running a high performance Cassandra database that suffered a major outage, Dave developed special techniques that allowed them to not only replicate the problem but to solve it and to restore the system in minutes and not hours. Further the visibility that this brought to the production environment allowed to right size their cloud resources, and to selectively replace components to deliver a much more efficient solutions, saving between 45% and 70% in costs. The ability to produce on demand environments also enabled developers to move faster.

Site-Reliabiity-Engineering (SRE) is a model developed by Google to describe a pro-active Ops team that works largely in code and automation. Dave defines two goals for SRE teams: to keep the systems up and to allow the developers to move as fast as possible.

To replicate this success in your Ops teams you need to:

1. Decide which kind of SRE team you will be. Google favours an [active model](https://landing.google.com/sre/) where SRE’s are directly accountable for keeping systems running. Netflix on the other hand favours a more [consultative approach](https://netflixtechblog.com/keeping-customers-streaming-the-centralized-site-reliability-practice-at-netflix-205cc37aa9fb) where the SRE team will help the dev teams that own the systems to keep them running.
2. Develop empathy in your teams so that they care about each other and about the customer. Teams that feel disconnected from the wider context of the software tend to focus on arbitrary metrics and reactive responses.
3. Burn your ticket system - ticketing systems are a source of waste and TOIL. Vivek Rau from Goole defines TOIL as _“the kind of work tied to running a production service that tends to be manual, repetitive, automatable, tactical, devoid of enduring value, and that scales linearly as a service grows”_. Solutions should be automated in code and self-service wherever possible.
4. Align your teams so that they are not in competition. Make sure that whatever framework you have for management or for objectives sets up those teams to work together. Consider giving them the same leadership.

# 8. Every problem is an opportunity to learn

> Erica Morrison, VP of Software Engineering, CSG International - “Getting Back Up When You’ve Been Knocked Down: How We Turned Our Company’s Worst Outage into a Powerful Learning Opportunity”

As previously mentioned CSG is North America's largest SaaS based customer care and billing provider and supports 65m subscribers across 500 customers worldwide.

On February 4th 2019, larger portions of the CSG platform went down due to an esoteric ethernet problem known as a spanning tree failure. The issue was so endemic that diagnosis was hampered because it affected even the monitoring tools that CSG would use to diagnose it. The problem was only resolved after days of painstaking diagnosis and reproduction which reproduced the complex systems failure.

The CSG operational lexicon already included blameless post mortems and incident analysis but they turned to a third party to do a deep dive on the incident to understand what had happened and why. As a result of this they rolled out training to 130 incident commanders and all of the senior management.

One realisation was that [complex systems failure](https://how.complexsystems.fail/) is not unique to the IT industry and that attributing failures to ‘human error’ is akin to saying that you don’t understand the failure.

# 9. Failure to learn is a failure to improve

> John Allspaw, Adaptive Capacity Labs - “Findings From The Field: Two Years of Studying Incidents Closely”

John Allspaw is veteran of the DevOps community and Adaptive Capacity Labs is an expert consulting group that specialises in research-driven methods for software organisations.

After reviewing hundreds of incidents over two years they have observed the following:

1. The state of maturity in the industry on learning from incidents is low
2. Significant gaps exist between technology leaders and hands-on practitioners on what it means to learn from indicients
3. Learning from incidents is given low priority, resulting in a narrow focus on fixing
4. Overconfidence exists in what shallow incident metrics mean and significant energy is wasted on tabulating them.

The typical legacy metrics used in incident management have little predictive or explanatory value and are frequently gamed. Because technology leaders are far removed from the technical detail they rely on these abstract summaries or statistics to interpret incidents and they usually overestimate the positive influence they personally have in incident responses.

Conversely, hands-on practitioners view post incident activities as a ‘check box’ chore and fear more what leadership thinks than they do not understand the origin and causes of the incident. They also have to exercise significant restraint to avoid jumping immediately to a solution that is only surface deep.

To learn more from your incidents, focus less on incident metrics and more on signals that people are learning from them across the organisation – see how often incident reviews are voluntarily read and shared. And to make continuous improvement more effective, consider separating the review of the incident from the allocation of remedial or preventative countermeasures. Once people have had time to digest the analysis of the incident and sleep on it, they will come up with much more effective action to avoid it happening again.

# 10. Grinding is not the answer

> Dr Nicole Forsgren, GitHub - A Tale of Two Cities: What We've Learned About WFH During the Pandemic

Nicole was one of the primary authors of the DORA [State of DevOps Report](https://cloud.google.com/blog/products/devops-sre/the-2019-accelerate-state-of-devops-elite-performance-productivity-and-scaling) along with Gene Kim and Jez Humble. She is now the VP of Research and Strategy at GitHub and works with their global data to identify patterns and trends in software development worldwide.

With the onset of COVID it has become clear that software work has expanded to fill the extra time available as we moved to working from home. However, the increased productivity is not evenly distributed and some people are really struggling with the isolation and communication challenges.

It is important to realise that this is not a balanced equation - the marginal gains in productivity for the 2/3 majority does not balance the significant detrimental impact to physical and mental health on the 1/3 minority. We need to support these individuals with mental health resources and personalised solutions to their challenges. Consider options like sabbaticals, moonlighting or research and development to keep employees motivated and engaged – people need positive outlets in this time of heightened anxiety.

Also be aware that managers have borne the brunt of this as the changes have disproportionately affected their work life and as they seek to support their teams. Make sure you don’t neglect their needs if you want to sustain a remote working culture.

In terms of working practice, COVID and WFH have added friction and so we need to counter that with more efficient processes to reduce the stress on the system. Having efficient communication channels and a good working environment at home are essential to making WFH sustainable. DevOps practices lead to a better, more repeatable process which reduces the overhead in building and operating software. Automation, distributed accessible resources (the cloud), automated security and visible operations all contribute to a better way of working.

Finally, any system which is full to capacity will suffer [congestion and catastrophic](https://www.amazon.com.au/Principles-Product-Development-Flow-Generation/dp/1935401009) failure at some point as there is no elasticity. The workload added during COVID has removed whatever spare capacity we had left and, coupled with the fact that it will last indefinitely, means we have to adjust our understanding of what sustainable work looks like.
