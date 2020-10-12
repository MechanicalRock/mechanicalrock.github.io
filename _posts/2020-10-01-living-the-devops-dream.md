---
layout: post
title: Living The DevOps Dream
date: 2020-09-20
tags: devops cloudnative product-development product
author: Tim Myerscough
---

This post is part of a series covering our development of DevOps Dream:
1. [Having a DevOps Dream][1]
1. Living the DevOps Dream

In my [previous post][1], I covered some of the background to DevOps Dream and where the idea came from.  In this post, I'd like to give some insight into how we _Lived the DevOps Dream_ - how DevOps influenced the way we delivered DevOps Dream.

After the initial concept was developed during our offsite team day, we took time to reflect and define our goals.  <!-- flesh out why goals are important -->  We defined three primary goals:
* User base: 100K players by end 2020.
* Engagement: 10% of players replay at least once.
* Positive sentiment: 10% of players talk positively about the game publicly.

Starting with the end in mind, our BHAG was to receive 100K users by the end of 2020.  To date, we have recorded about 1500 users, so unless _magic happens_ we are unlikely to hit that target.  We achieved a more realistic sub-goal though: to achieve 1000 users within the four weeks.  Analysing the disparity, achieving our major goal was only realistic either through expensive marketing or if the game went _viral_.  Whilst we would love DevOps Dream to have broken the internet, it wasn't a likely outcome with our modest marketing spend.  

We wanted to build something that was quick enough to play in a coffee break, yet had enough depth to make you think and could be used to spark discussion within teams.  We are happy that we have achieved our goal.

Our more modest goals for engagement and positive sentiment were achieved with flying colours: nearly 20% of users replayed at least once with an average session duration of 9 minutes.  And a social media sentiment analysis recorded 90% positive feedback.


<!-- image here - cup with stars - mission achieved -->

<!-- _This is the crux of this post, need to move it earlier..._ -->
But our unwritten goal was to lead by example: demonstrate how effective DevOps practices drive successful business outcomes.  Our project retrospective paints a clear picture:

> As a software delivery project, DD was extremely successful:
> * We went from concept to launch in 4.5 months / 167 days
> * We completed 332 issues and 85% first pass complete (15% rework)
> * We had very low WIP and good average cycle time of 2.5 days
> * By DORA’s own metrics we achieved **Elite** status:
>     * We had less than X per 100 failed changes
>     * Deployment Frequency: We averaged 2.5 deployments per day, with a maximum of 9
>     * Lead Time to production: averaged 52 minutes
>     * Change Failure Rate: < 5%
>     * Time To Restore: N/A*

But how did we achieve such impressive metrics?  By living the DevOps Dream of course!

## Data Driven

Metrics
 - number of commits, PRs time-frame.
 - how we capture the metrics
 - why metrics are important

State of DevOps, retrospectives.

- DORA stats:
- 4 key metrics and how we generate them

## Value Stream

The goal for any software value stream is to deliver value.  Delivery of value is hard to measure due to the variability of the requirements.  

For DevOps Dream, we measured our value stream based on the delivery of Stories.  Over the course of development, the lead time to completion averaged **4 days 20 hours**.

![Value Stream for DevOps Dream](/img/devops-dream/dds-value-stream.png)

But we cannot go further without discussing our Definition of Done:
* Does the new feature meet all the acceptance criteria/scenarios set for it?
* Is the build/CI pipeline green?
* Are any new tests added with this change reporting in whatever dashboard you are using?
* Are all the assets required (including BDD/BDI scenarios etc) checked into source control?
* Have you updated any tickets, stories or requests with appropriate comments? 
* Have you updated any (external) documentation? (e.g. release notes on the wiki, design docs)
* Have observability requirements been satisfied?
* Has someone eyeballed it in production? 
* Has the Product Owner reviewed it?

This is not the same as what is required for developers to merge their code branches with the trunk (pull request process). 
>    You should be able to merge a PR without meeting the DoD. PR is about code quality and review process, not feature completeness. If you combine the two, you end up with long lived branches which, may, lead to integration issues further down the line. Feature toggles, etc allow you to merge work that is not complete. But you don’t want to merge crappy code.
>  – Tim Myerscough, July 2017

**On average having committed to a piece of work, the team were able to deliver it, to production, in under 1 week.** 

And that includes discovery time.

To every member of the development team for DevOps Dream:

![Kryten from TV Show Red Dwarf - Smug Mode Activated](/img/devops-dream/dds-smug.png)

So proud.

## Team Structure

> Any organization that designs a system (defined broadly) will produce a design whose structure is a copy of the organization's communication structure.[2][3]
> — Melvin E. Conway

Suboptimal team structures set you up for failure.  We prefer small, cross-functional teams to maintain a high degree of autonomy.  For DevOps Dream, we opted for a team of 5:

* 1 UX Designer / Delivery Lead
* 3 Developers
* 1 Product Owner (part time)

Importantly there are roles we don't call out specifically:
* Tester is not a role we use: **Quality is not somebody else's problem.**
* Ops/SRE is not a role we use: **Operational stability is not somebody else's problem.**

Instead, Mechanical Rock developers are 'T-shaped': generalists able to cover all aspects of the DevOps lifecycle but each with their own specialisms such as Web Development or SRE.

The team was responsible for the whole lifecycle.  The lack of hand-offs eliminated waste, and drove home the importance of quality.

## Planning

We have looked at our own product development previously and something we have learned is that trying to build them using an opportunistic approach, when people have free time, doesn't work.  For DevOps dream, we chose to commit: the core development team was protected for external pressures to enable continuity and focus.  Delivery was broken down into **1 week sprints**, culminating in a Friday afternoon showcase to the wider Mechanical Rock stakeholders.

When approaching planning, I had a few aims:
* Firstly, planning is boring.  We have all been in planning sessions that seem to go on forever.  For DevOps Dream, I wanted planning to be quick, yet equally effective.
* Planning alone does not provide any value, therefore planning should be deferred until as late as reasonably possible.
* Planning has different goals for different audiences.  High level planning is important for wider stakeholder engagement and budget management.  Detailed planning enables the team to turn high level hand-waviness into reality.  Therefore, any effort spent on planning was targeted to the audience it was for.
* We operate on a fixed cost, variable scope model: we had a timebox for delivery, within that timebox we would work on the highest priority items.  At the end of the timebox, we evaluate whether to invest more time.

The last point is worth a bit more exploration.  We see many clients that are constrained by organisational budgetary processes.  Long, detailed, budgetary approval processes lead to protracted discovery and pre-planning which in turn harms agility and causes re-work.  By having a more flexible approach you can retain cost control whilst focussing on value and deferring planning until as late as reasonably possible.  Using this approach, **we were able to have our first commits to production within 1 week from initial project approval**.

We split planning into the following focus areas:
* **High level roadmap** - As we kicked off the project, we developed a high-level delivery roadmap, planning for UX discovery, development, beta-testing, initial release and marketing.  The picture at this stage was extremely fuzzy, but provided us with the end goal.
* **Forward planning** - As product owner, I worked with the delivery lead to prioritise the backlog and roughly plan 4-5 sprints of work.  The aim of the high level planning was not to hold to a schedule, but to get a rough feel for the size of the problem, knowing things would crop up and push things to the right.  Anything not assigned to a sprint was prioritised and placed in the backlog.  As contingency, after every 3-4 sprints of pre-planned work, I left a sprint totally unallocated - to cater for reality whilst still enabling a high level view.  As development progressed and a product started to form, I used [JIRA's version feature](https://confluence.atlassian.com/jirasoftwarecloud/releases-and-versions-980451731.html) to differentiate features required for *Beta Testing*, *Public Release* and *Below the line* - things we were probalby unlikely to get to for initial release.
* **Course correction** - On an ad-hoc basis, following a need/discussion highlighted during our daily stand-ups, I would review the overall priority list in order to tweak things as development progressed.  This would generally occur once every couple of sprints or so.  Having previously marked items with an appropriate release meant this process was quick and painless, usually taking less than 10 minutes.
* **Sprint planning** - Planning for the following week was performed on a Friday, after showcase, and involved the team reviewing current progress and evaluating items suggested for the following sprint.  Since items had already been prioritised, this was simply a matter of moving the commitment up/down based on the teams estimation of how much they felt they could achieve.  **Items were never allocated to individuals and sprint planning rarely took longer than 10 minutes.**
* **Task Breakdown** - Sprint planning was performed at a story level only - each one a promise of a conversation.  During each sprint, when an individual took ownership for a ticket, they would be responsible for breaking down the story into appropriate sub-tasks that made sense for them - the subtasks were what we mainly discussed during standups.

At the risk of labouring a point: **all planning activities generally took less than 30 minutes per week**.  One thing I see that regularly results in protracted planning is estimation.  Teams spend hours of their lives that they can't get back estimating work.  The reasons are often relate to control - either motivated by command and control structures looking to hold people to a delivery schedule based on guesswork, or constrained by a budgetry process that requires detailed tracability, allocation and approval.  For DevOps dream, we essentially followed [#NoEstimates](http://zuill.us/WoodyZuill/2012/12/10/no-estimate-programming-series-intro-post/).  Whilst having had a general appreciation for what "No Extimates" was about for years, I must confess that I had never actually read the original post until I started writing this piece.  Whilst I would not try to suggest a case for [synchronicity](https://www.merriam-webster.com/dictionary/synchronicity),  we followed the intent of the Woody's original post very closely.  It's not that we never do any estimation, but rather that we never wrote them down or spend much time over them.  As Product Owner I already had a relatively clear picture of the order of importance of stories.  The effort involved in a particular story was, usually, unlikely to effect it's priority that much meaning any discussion was waste.  As we discovered new stories, I would ask questions like "How long do you reckon X will take?  Days or weeks?" or "Is story X bigger, smaller or about the same to story Y?".  The answer to these two simple questions provided enough data to affect priorities.  Sometimes, something that was deemed simple would bubble up the priority list.  Less frequently, a story was de-prioritised after the team felt it would be a lot of work.  Essential to this idea is trust: as Product Owner, I had trust in the team to develop features as quickly and sustainably as possible.  The team trusted me not to hold them to account for an estimate based on a 30 second conversation.  The result: I was able to quickly and effectively plan upcoming work, the team was able to do _"less talky talky, and more worky worky"_.  Early discussions were much more focussed on _"the what"_, rather than _"the how"_ or _"how long"_ which enabled the team to strive for simplicity and push back for an alternative simpler version.

I would also like to linger to talk about our daily stand-ups.  I have experienced many teams that follow Scrum ceremonies and call them agile.  If your daily stand up takes 30 minutes and is a creeping death as each person recounts "Yesterday I .... Today I'm .... No blockers." - sorry, but you're doing it wrong.  You have a board, somewhere, USE IT!  During stand ups, we walk the board - right to left: we discuss each item, what is blocking it from moving forward - and most importantly: identifying how to remove the impediment.  So less, creeping death, more focussed progress: "Ticket 123 is ready for code review.  Who can pick that up this morning?".  When our standups extended past the 15 minute mark, it was due to discussing how to resolve an impediment: technically an 'offline' discussion - but since the whole team wanted to be engaged to resolve the issue, does the differentiation really matter?

## Discovery


BDD - requirements elaboration

## Delivery

The culmination of the above, along with our rigorous technical practices enabled us to deliver a consistent flow of work into production.  

![Cumulative flow diagram for DevOps Dream](/img/devops-dream/dds-cumulative-flow.png)

Through continuous deployment, and separating deployment from release, the **lead time for change to production averaged < 1 hour** from commit to trunk.  

The team averaged **2.5 deployments to production per day**.  The peak was 9 deployments to production in one day.

Did I mention?

![Kryten from TV Show Red Dwarf - Smug Mode Activated](/img/devops-dream/dds-smug.png)


## Launch

- dark launch - early feedback
- closed beta testing - shout out and thanks
- prototypes -> build -> user feedback -> polish

<!-- # References-->
[1]: /2020/09/22/having-a-devops-dream.html