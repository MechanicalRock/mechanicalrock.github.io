---
layout: post
title:  State of DevOps 2019
date: 2019-mm-dd
tags: devops
author: Tim Myerscough
---

Part 1: General analysis and trends 2018 - 2019
Part 2: Reflection on Mechanical Rock Performance
Part 3: Reflection on client performance

# State of DevOps 2019

The annual DORA State of DevOps 2019 report came out last week.

Key takeaways for this year...
- 20% of all teams are now Elite Performers.
- Delivering software quicky, reliably and safely enables organisational perofrmance: highest performers are twice as likely to meet or exceed organisational performance goals.
- Once again, organisations of all types and sizes have the ability to become elite performers.
- DevOps is a cultural change, not a tooling or technological one.  Creating a community structure at all levels of the organisation.  Communities of Practice (woodside).
    - Internally, we are building communities around our 4 keys pillars (...TODO...)
    - We share information internally, on a weekly basis: presentation skills, demonstrate learning, knowledge sharing.
- There’s a right way to handle the change approval process, and it leads to improvements in speed and stability and reductions in burnout.
    - We've been pushing this
    - Our view of a deployment pipeline
        - Trunk Based Development
        - No manual approvals
        - shift left: security, audit, etc (link to blog posts)
- The top performers are increasing: in 2018, elite performers represented a 7% subset of the high performance group.  This year, the elite group are now distinct, making up 20% of respondants.  Medium performers risk being left behind without a strong improvement focus this year.
- Research this year has shown that heavyweight change processes, including multiple handoffs and CAB approvals, are negatively correlated with SDO performance.  We have advocated lightweight, automated, approval processes and it's great to see this backed up by data.  By focussing on the strategic goals, rather than routine approvals, leaders are able to use their experience where it counts: evaluating the trade-offs between innovation and risk and improving organisational effectivness.

# SDO Performance

This year's report includes a model for improving SDO performance.  Whilst we can always improve, it's encouraging to see our internal areas of improvement validated within each of the areas of the model.  I have [previously written](TODO) about how trunk based development and automated deployment, coupled with an automated deployment pipeline improve organisational effectivness.

Our [Cloud Native Application](TODO) pillar, is focussed on leveraging serverless technology, enabling us to realise high availability and realise the 5 essential characteristics of cloud computing, whilst having operational costs in the $10's-$100's.

"This year, we found that automated testing
drives improvements in CI."

loosely coupled architecture - Our focus on Serverless and Event Driven patterns are a natural fit for loosely coupled systems.


# Goals for 2019

what's my goal for 2019?  What will I look to change?
 - improve change failure rates: < 5%
 - improve MTTR: < 1 hour.


What to I want to improve?
- culture of psychological safety - we have an exceptional technical team.  And I want to keep us that way.  In a recent [podcast](https://www.youtube.com/watch?v=e2dfOfedl3A), Dr Simmons discussed how intrinsic motiviation can risk burn out.  blah blah what do I want to do...


SDO Performance:
- monitoring

Improve measurements:
- metrics for ALL projects
- Availability metrics for all serverless projects
- blah.


# Performance Metrics

Once again, the DORA report assesses organisational performance based on 5 key metrics, covering software development, software deployment and service operation.

![Key Performance Metrics](({{ site.url }}/img/state-of-devops/sod-performance-metrics.png))

1. Lead Time - Calculated as the average time from commit to production.
1. Deployment Frequency - How often changes are deployed to production.
1. Change Failure Rate - How often changes released to users result in degraded service.
1. Time to restore service (MTTR) - How it takes to restore service following a degraded state.
1. Availability - The service uptime for end users.  



---------------
Part 2: Reflection on Mechanical Rock Performance


Reflection against our working practices
 - what we already do: go us.
 - what we shall be focussing on this year...


## Performance Metric Analysis

### Changes we've made

Key Changes we've made this year:

Deployment Frequency:
- Introduced capture of pipeline metrics as standard to measure our deployment frequency.

Lead Times:


Time to Restore:
- Capturing MTTR metrics as standard (TODO - blog post)


Change Failure Rate:
- Metrics captured and tracked regarding the pipeline.  Currently inadequate, since they capture failures within the pipeline, that have not resulted in user facing degredation.  We are a victim of our own success - we have comprehensive testing, which means there are pipeline failures that never reach production.
- We have established 'andon chord' practices within some teams for tackling pipeline failures. (TODO - check how many)

### How we performed

Deployment Frequencies:
 - Lead Times and deployment frequencies are strongly correlated within the majority of our projects.
 - We follow continuous deployment by default, from the start of our projects and have improvement processes to review the CI pipeline when it goes over 10 minutes and review the CD pipeline when it takes longer than 1 hour.

Lead Time: we work with a number of clients, at a range of maturities.  Leading projects have lead times average as low as 4 hours.  

Key Observations:
 - TODO - what do I want to say???

 - Elite performers: 
    - practices include:
        - Trunk Based Development
        - Pairing
        - Behaviour Driven Development
        - Continual Compliance

 - Barriers to medium/low performers:
    - Lack of automated testing
    - Manual approval gates
    - Fear of change - training, compliance, 
```
TODO - put it in a table.
```


Further Reading:
 - https://www.thoughtworks.com/radar/techniques/four-key-metrics
 
 
Sound Bites:
- "Cloud continues to be a differentiator for elite performers and drives high performance." - we deploy to production within a day.  Consistency across all environments.

Other posts:
- Security Shift Left - woodside influence.
- Audit and Governance - Keystart.
   - "Our analysis shows that any team in any industry, whether subject to a high degree of regulatory compliance or not—across all industry verticals—has the ability to achieve a high degree of software delivery performance." 



We should take the survey next year...
- Australia is underrepresented in the survey - commit to completing the survey for this year.
  - We commit to completing the survey next year
  - We shall be introducing surveys with our clients, consistent with DORA, and shall be submitting them on their behalf.  So we can manage our own impact and improvements, and contribute to the report next year.
    - We shall also cover follow-up surveys 6 months after each engagement, to measure improvements.
    
    
26% from 10,000+ organisations: a large number of responders will be from the same companies - skewing the results?

... Another post?. ...
SDO Performance metric - Since Mechanical Rock was formed, we have had a strong "Dev" focus.  We  focussed on [Systems Thinking](TODO) through Trunk Based development, and continuous deployment.  Shifting-left to improve our lead times.  Throughought the last 12 months, we have been increasing our focus on the "Ops" side; improving and systemitising our feedback loops.  We have formed new, and strengthened existing, partnerships with companies like Sumo Logic, Cloud Conformity, Snyk.  We've welcomed a number of new additions to the Mech Rock family who have brought valuable skills from the Ops space.  TODO - something else here - what's the outcome?  Ops Templates?  Gartner talk?
  - We have improved our metrics capture, aligned with the DORA report.  Over the next 12 months, we shall be looking to capture, and report, these metrics as standard across all our projects.
  - All part of our continual improvement journey.
  


----

Part 3: Reflection on Client Performance


----

Part 4: Effective Change Management

The latest DORA report came out recently. **TODO link to report**

A key highlight for me, and reflects on our own change management processes, was how to support effective change management processes.

"For example, segregation of duties, which states that changes must be approved by someone other than the author, is often required by regulatory frameworks. While we agree that no individual should have end-to-end control over a process (the intent of this control), there are lightweight, secure ways to achieve this objective that don’t suffer the same coordination costs as heavyweight approaches."

We have robust audit mechanism built into our process, all of which are reflected in the DORA report.

* We practice [Trunk Based Development](TODO), with PR branching for review.
* We prevent direct push to `/master` branch.  All changes are reviewed by at least one other developer.
* We have automated CI reporting per branch.
* We practice a GitOps model, where possible, meaning changes to production systems form part of the same audit log.