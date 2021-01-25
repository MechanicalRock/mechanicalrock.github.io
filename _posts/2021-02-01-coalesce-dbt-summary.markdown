---
layout: post
title: Highlights from the DBT Community's Coalesce Conference 
date: 2021-01-25
tags: data dbt elt etl transformation
author: Paul Symons
image: img/blog/coalesce2020/banner.jpg
---

In this article, I want to share some of my highlights from the recent [Coalesce 2020](https://www.getdbt.com/coalesce) conference, where analytics teams from all over the world shared their experiences about improving and accelerating [Analytics Engineering](https://blog.getdbt.com/what-is-an-analytics-engineer/), and how adopting [DBT](https://www.getdbt.com) has often played a pivotal role. Held as a virtual conference in December 2020 by [FishTown Analytics](https://www.fishtownanalytics.com/), it was presented for, and by, the community of DBT users worldwide.

## **D**ata **B**uild **T**ool - a quick recap

To understand what DBT is for and how to use it, you should first read their own [introductory documentation](https://docs.getdbt.com/docs/introduction), but to paraphrase from the first page:

> *dbt does the T in ELT (Extract, Load, Transform) processes – **it doesn’t extract or load data**, but it’s extremely good at transforming data that’s already loaded into your warehouse.*

It is a remarkable tool, but perhaps more remarkable are the ways it helps teams to parallelise, stabilise and democratise their practice and knowledge of data in the organisations where they work. 

## Aim
The conference headlined with this statement:

> *Coalesce 2020 is a dbt community event dedicated to advancing the practice of analytics engineering.*

In my opinion, this goal was definitely achieved, to the lasting benefit of the community - both its existing and future members. I recently came across [this wonderful blog](https://medium.com/@social_archi/third-spaces-6245f99645b0) reflecting on a 1989 book I'd never heard of, called [The Great Good Place](https://en.wikipedia.org/wiki/The_Great_Good_Place_(book)); the book identifies and describes *Third Places* as the communal spaces and gatherings in which we additionally seek solace and find meaning, outside the other well known primary spaces of *Home* and *Work*.

Whilst the blog re-tells the learnings of the book through the lens of Urban Design, it also identifies some clear principles that typify what makes the [DBT community](https://community.getdbt.com/) such a valuable and inclusive network:

* **neutral ground** — public
* **leveling place** — open to all demographics
* **conversation** — usually the main activity, however not the only activity
* **open, accessible** — long opening hours, accommodating the occupants needs
* **reservoir of regulars** — set the tone of the place, and welcome newbies
* **plain, homely, non-pretentious** — making people comfortable
* **playful** — lots of laughter and banter
* **home away from home** — warm and inviting

The DBT community is an amazing [Power-Up](https://en.wikipedia.org/wiki/Power-up) for anyone seeking to improve what they can do, with the data they have access to.

You can watch the [Coalesce 2020 Sessions Playlist](https://www.youtube.com/watch?v=M8oi7nSaWps&list=PL0QYlrC86xQmPf9QUceFdOarYcv3ETSsz&index=1&ab_channel=dbt) on YouTube.


## Favourite Takeaway

If I had to select one favourite message from a presentation, it was Ashley Van Name's recollection of how JetBlue made choices around their new data stack:

> *We made a few bold choices based on the type of data stack we saw many smart companies moving towards. We sort of figured, if it worked for them, we could probably make it work for us.*

The takeaway for me is not about the tools, platforms or technologies, but about the principles that underlie a modern data stack that so closely relate to the [Five Ideals of DevOps](https://itrevolution.com/five-ideals-of-devops/):

1. Locality and Simplicity
1. Focus, Flow, and Joy
1. Improvement of Daily Work
1. Psychological Safety
1. Customer Focus

If you were to watch only one video from Coalesce, I would recommend it be this one.


## Prevalent Themes

As you can imagine with a playlist of 42 presentations from a conference that spanned 4 days, there is a significant mass of information and insight to consume. Yet there were a few themes that cropped up time and again that are worth focusing on

### Coming of (the new) Age

A common theme was the seismic shift in how teams collaborate with data at scale. There are so many factors at play, but some of the many called out include:

* [The Rise of Cloud Data Warehouses](https://mechanicalrock.github.io/2020/11/09/the-cloud-data-warehouse.html) fuelling the shift from Extract, Transform, Load (ETL) towards ELT instead
* Sustained growth and competition in the SAAS Data Extract and Load tooling market supporting the transition to Cloud Data Warehouses
* The insatiable appetite within organisations for access to quality data to drive decision making
* How DBT helps teams concurrently and safely deliver insights and quality data  

Many presentations talked about the role of a data team, their relationship to the wider organisation, and why communication, trust and knowledge sharing are indispensable partners to technology;  a few included back-references to Justin Gage's popular post from 2019 titled [Data as a Product vs Data as a Service](https://medium.com/@itunpredictable/data-as-a-product-vs-data-as-a-service-d9f7e622dc55) and furnished further with their own experiences of pivoting from being a reactive service team to a pro-active partner.

Notable in almost every presentation were the ability of teams to be more **self-reliant**, engage more diverse people and **skill-sets**, focus on the parts of their job they enjoyed more, and ultimately **serve their customers better**.


### Collaboration and Knowledge Formation

Never more so than in 2020 has the challenge of being co-located virtually, rather than physically, been more keenly felt.

Many teams reflected on their strategies - beyond using collaborative workflows and tools promoting open-ness and transparency such as DBT - to enable continuity of learning and upskilling, in a year where many new recruits would on-board to companies remotely. In many cases, presenters affirmed their commitment to keeping documentation about their work, including the role that [DBT's self generating documentation](https://docs.getdbt.com/docs/building-a-dbt-project/documentation) played in communicating intent and understanding between teams and consumers. 

In two very different talks, both Tristan Handy and Andrea Kopitz teach us that accepted knowledge is effectively the building of organisational consensus. Andrea's comment around creating some documentation - even if only temporarily useful - is often better than no documentation at all. It re-iterated to me also the importance of being assertive and descriptive in documentation to allow others to challenge, so that together we may reach a better consensus.

On a more technical level, many talks focused on the success teams encountered by consolidating the knowledge and business logic of data domain and insight generation within their DBT projects, and how this had promoted more transparency and trust between consumers and producers of data.


### The Right Testing Matters

There were a couple of great talks about testing in Coalesce 2020; beyond introducing tools and technologies, they more importantly offered:

* The importance of testing as part of [SRE](https://sre.google/sre-book/table-of-contents/) obligations and meeting service level agreements
* Different types of testing, e.g. modelling regression vs. data regression, including periodic factors
* The value of testing compared to the cost of troubleshooting queries from consumers
* The use of testing as a form of documentation about expectations and subject matter expertise

One important reminder I took away was, ensure to test the right thing: avoid vanity tests and appreciate that needs and expectations, as well as data, change over time - and therefore, so should your tests; even if it means deprecation.


### Trust 

Perhaps the most enduring theme throughout the presentations was trust:

* Why is it important?
* What happens when we don't have it?
* How can we build it?
* How can we retain it?

Trust exists in many contexts; some examples were how teams build trust amongst themselves with testing and documentation; how they maintain it with peer teams using SLAs, relationships and communication, and good engineering practice; how they build it with stakeholders and decision makers, to boost their standing and perception as a critical partner within an organisation.

I sensed in many presentations a burden within data teams that their work should reflect the most holistic view possible of their organisation. The concept of trust featured heavily in many of their endeavours. All of the following stood out as important assets in building and maintaining that trust.

- Engagement and Discoverability of Data
- Operational Resiliency of Data Services and Products
- Verifiable Data Quality In Decision Making
- Knowledge Formation and Consensus Building
- Finding and Partnering with the right stakeholders

If your stakeholders never challenge the assertions you make, then perhaps they are not fully representative of the customers you believe you serve. 

## Highlighted Talks

Below are a selection of videos from Coalesce 2020 that stood out to me for one reason or another, which I will elaborate on. However, note that all of the content from Coalesce 2020 is very much worth watching, so review the playlist and seek out the content that is most relevant to you!

### DBT 101

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/M8oi7nSaWps" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

Carly gives a great backgrounder on the industry and experiences of working in ETL that many people will relate to, with tools like Informatica. Equally, she illuminates many of the basic challenges that DBT helps to address, including adopting many of the practices in data work that are typically commonplace now in Software Engineering. This video is an excellent starting place for anyone looking to understand what DBT does.

### The Post Modern Data Stack

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/C_R6VHJfQn4" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

In this broadly focused video, Drew draws parallels between periods of art, and the evolution of data processing. It's a great exercise in zooming out and seeing the bigger picture - in this case, how the decomposition of data platforms in to stacks of more de-coupled components, focused more around the teams and capabilities organisations have, the challenges for which customers are truly seeking answers, and the capability to adapt to change and advancements in technology.

### How JetBlue became a Data-Driven airline using DBT

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/MlQGHR5bvRI" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

This video is a clear favourite for me, simply for the sheer volume and depth of insight it provides. Ashley covers a multitude of topics that almost every organisation on a data journey will encounter at one time or another:
* Defining what it means to be *data-driven*
* Identifying what your modern data stack should look like
* Why a Transition Plan is a fundamental keystone to the success of any large data migration
* How DBT helped JetBlue significantly increase their internal contributor rate towards data work

Amongst these topics were many other themes including the importance of early engagement when introducing change to an organisation, investing in the training of your people, and the commitment to sunsetting your legacy systems. Check it out!


### How JetBlue secures and protects data with DBT and Snowflake

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/NPQOTm1XITw" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

Everyone at some point will need to deal with privacy requirements in a data warehouse, and this shorter talk gives a great overview of JetBlue's iterative journey to tackling this challenge. To me, the greatest part of the story is how the goal is achieved latterly by policy, as opposed to processing; this typifies to me how Cloud Data Warehouses are stepping up to meet common customer challenges.


### Organisational Epistemelogy - Or, how do we know stuff?

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/r75Rd48toBk" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

I am going to be honest and admit that this talk hit me right in the feels. You don't need to have worked at an enterprise-scale organisation to appreciate this video, but if you have, then I suspect many of the messages in this one will resonate strongly with you.

Throughout our careers we variously play roles of mentor, mentee, leader, contributor, etc. - often many of those roles at the same time. This presentation reflects on organisational knowledge and consensus building, and made me muse on *How do we get better at getting better?*

In particular, Tristan's comparison of the nervous systems of Jellyfish (a ["nervenet"](https://en.wikipedia.org/wiki/Nerve_net)), compared against the predominant animalian [central nervous system](https://en.wikipedia.org/wiki/Central_nervous_system), provides a compelling context by which to explore the way we not only share and disseminate information within an organisation, but how it can affect the way we grow and scale. In many ways it is similar to how [AWS EventBridge simplifies building cross-account capabilities](https://aws.amazon.com/blogs/compute/simplifying-cross-account-access-with-amazon-eventbridge-resource-policies/) in the cloud.

In the end, Tristan ties it back to the modern data stack and importantly, what is required to maintain trust in a landscape where decision makers *"plug directly into the spinal cord"*


### Quickstart your analytics with Fivetran dbt packages

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/-jUavnap5SU" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

In this short video, there is an introduction to Fivetran DBT packages, namely, the separation between *source* packages that represent how Fivetran loads the data directly from each connector, and the *transform* package that turns that raw data into usable insights.

This video is a good reminder of the extensibility of DBT using packages.


### Building Robust Data Pipelines with dbt, Airflow and Great Expectations

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/9iN6iw7Lamo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

Given the volume of content from Coalesce, I watched many of the videos at 1.25x speed - if you are doing the same, you should slow down for this one! Sam Bail squeezes a lot of insight in, and calls it like it is:

> *You should test your data. No really - if you are not doing that already - I don't know how you sleep at night*

She follows on with quotes from some of her team's users:

> *Our stakeholders would notice data issues before we did... which really **eroded trust** in the data and our team*

Again, this theme recurs throughout Coalesce 2020, and contributors offer great antidotes to these problems.

What follows in this presentation is a straight-forward and compelling introduction to Great Expectations and when to use it. Rounding out this fast-paced talk is this useful experiential insight:

> *You should test your data whenever there is a **handoff** between teams or systems*

Great advice echoed ...


### Empowering your data team through testing

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/9uRXoLufgJY" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

... in this talk from John Napoleon-Kuofie about how the right testing, at the right stages, simplifies and reduces the cost of troubleshooting data quality issues. Other great insights include:

* Using snapshots to assess data quality over time
* Write tests to safeguard against problems that occurred in the past (subject to likelihood)
* Define metrics around acceptable change when data refreshes


### Run your data team as a product team

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/zoqyefI5VKU" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

Emilie Schario and Taylor Murphy reflect on what it means to run a data team as a 'product team'.  Whilst Justin Gage's article about *DaaS vs DaaP* models the differences between these modes of execution, this presentation by Emilie and Taylor reflects on how a Data Product Team adds value:

* Creating a clear vision and strategy that describes the value and opportunity data offers an organisation
* Taking responsiblity for Data Discovery, and not just as a technology challenge
* Promoting and Enabling Data Literacy within an organisation
* Invest heavily in knowledge sharing and documentation - both traditional and engagement based such as *data clinics*

One of my highlights from this presentation was a comment Emilie makes in the Q&A section at the end. Elaborating on the importance of C-level executive buy-in for data, she describes the experience of seeing *"great data first adoption - data running through their lifeblood"*, at companies where the importance of data driven culture comes **from the top down**, as well as from the bottom up.

### Three Barriers to Effective Data Communication

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/zFBfV-25dS4" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

In brief, this presentation focuses on finding the hallowed nexus of Effective Data Communication between

1. Engineering Practice
1. Stakeholder Involvement
1. Company Discoverability (of data) 

Despite being a shorter presentation, it was not short of insights - I took away some great reminders

* Embracing Taxonomy - *"speaking the same language"* - acts as an essential foundation for common understanding across disparate teams
* Ensuring your stakeholder group can adequately critique your assumptions
* Data teams should seek to remove themselves as an intermediary in discussions around data

I liked the reference to [DBT Exposures](https://docs.getdbt.com/docs/building-a-dbt-project/exposures/) and how they can help cross-reference the indirect way in which modelled data is used. 

### How to build a reputation on more than just Dashboards

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/Kub2bXrKmOE" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

Before the first 30 seconds are up, Andrea Kopitz sets out the aspirational goal

> *I believe the best data nerds and data teams are the ones that always try to align themselves with the goals and interests of the business*

In this super-concise but jam-packed presentation, Andrea illustrates the value data teams can offer organisations beyond simply cranking out dashboards. Along recurring themes of growing to be a partner to the business as opposed to servicing dashboard requests, she gives many great examples to assist that journey of growth

* Facilitating communication through a single, common and accessible channel to promote and encourage interaction and inquisition
* Consider every business request an opportunity to learn more about business domains
* Anchor the knowledge gleaned into documentation to accelerate shared learning and growth
* Set context around dashboards to manage expectations and state original purpose and assumptions / caveats

In particular, I liked the suggestion to encourage and collaborate with early adopters, a formula I've seen work well and also echoed in JetBlue's transition to a data-driven organisation.


## Summary

I came away invigorated after watching Coalesce 2020, not only about the topics and community around DBT, but of the future and rapid growth we will see in data.

It's often easy to imagine the future dystopically, in light of data mining and privacy violations. However, it inspired in me a more local, contextualized growth opportunity for companies to understand better what makes them tick, and what really determines their success, based on data instead of *gut feel*. I truly believe DBT and the wider movements around ELT are making these capabilities more accessible than ever for businesses of all shapes and sizes.

I'll end this post with a panel discussion from Coalesce 2020 - *Hiring a diverse data team* - it educated me a lot on diversity and inclusion beyond the surface, and how to really find your best team by reaching out to all qualifying candidates in the first instance. There are so many learnings in this talk, but to call out just a few:

* Hire for aptitude over educational prestige
* Look beyond your immediate network of peers
* Sponsor or assist organisations that support under-represented groups
* Anonymise your applicant process early to counter bias
* Avoid conflating "Cultural Fit" with a more substantive "Values Fit"
* Assess candidates against well defined criteria
* Identify specialized or non-mainstream avenues to place job ads first
* As a company, have your interview panels represent the diversity you embody 

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/Uwj23safIRc" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>



I hope I have inspired you to check out some of the great content from Coalesce 2020; it is well worth your time to watch for yourself.

Finally, my sincerest gratitude to Fishtown Analytics and the DBT community for their contribution!

<sup><span>Banner Photo by <a href="https://unsplash.com/@adigold1?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Adi Goldstein</a> on <a href="https://unsplash.com/s/photos/together?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Unsplash</a></span></sup>