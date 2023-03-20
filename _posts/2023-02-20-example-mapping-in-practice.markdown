---
layout: post |
title: Example Mapping in Practice
description: Example Mapping - Breaking boundaries to provide the most effective means to derive requirements and create common understanding within the team!
date: 2022-08-06
tags: [examplemapping, bdd]
author: Andrew Tyler
image: /img/blog/examplemapping/emOverview.png
---

![Example Mapping](/img/blog/examplemapping/emoverview.jpg)

<br/>

In my many years as a Software Engineer, Scrum Master and Delivery Lead I've worked on projects of various shapes and sizes. I firmly believe that one of the most challenging things you face in any project is building a common understanding of requirements between the customer and development team.

To me, example mapping is the closest you can get to perfection. This article sums up the principles of example mapping, compares the opposition, and provides examples itself to help you master it in your own teams.

---

# What is Example Mapping

Example Mapping is a technique using coloured cards to facilitate a session with the dev team (or at least one representative from) and Product Owner and subject matter experts (SMEs) to elaborate a user story and create a common understanding amongst the team.

Yellow cards represent the user story/feature, blue cards specify business rules, green cards provide examples and red cards are for asking questions.

For this post we are going to be working on a fictional app we are building based on the 'Kwik-E-Mart' from everyone's favourite (well if it's not then it should be) cartoon TV Show 'The Simpsons'.

Apu (the store owner) has decided to go digital to boost business and support his growing family.

Apu kickoffs the session by presenting the requirement:

_Discounts are offered based on the previous month's spend_

Apu then offers up two rules he has already thought of and places them on the canvas on blue cards like so:
![Example Map](/img/blog/examplemapping/initialrules.png)

The team get about asking questions around the discounts and limit:
![Example Map](/img/blog/examplemapping/questions.png)

The questions lead to examples being specified, and a new rule emerges which needs examples to help explain:

![Example Map](/img/blog/examplemapping/examplemap.png)

To recap the process. The product owner brings a new user story to the session, presents to the team with a brief explanation and then the facilitator sets to work . I like to run my sessions as follows:

1. Allow the Product Owner to describe the User Story including the how and why
2. Set a timer for five minutes quiet time and allow the team to raise questions ready for the Product Owner
3. During the quiet time the Product Owner may start creating rules on the blue cards
4. Once quiet time is over I go through the question cards and get the team member who raised it to ask the Product Owner the question
5. As questions are answered, new rules are defined and then clarified using examples as a whole team exercise
6. The board is continually refined as questions are answered, new rules written and examples provided
7. To ensure that we have something solid to start on, I try to keep focus on one rule at a time to ensure that sufficient examples are required and continually ask "Dev team, are you happy you can start building this" and "Product Owner, are you happy with this outcome"

At the end of the session the goal is to at least have a starting point for the user story development and a plan to follow up any additional sessions required.

<br />

# The Opposition

There's obviouslt many ways to specify and communicate requirements, so lets stack Example Mapping up against the opposition.

## The Func Spec

![Example Mapping](/img/blog/examplemapping/funcspec.jpg)

Ahhh the old faithful! What can go wrong? Well...let me tell you...
As 'Engineer Liason' [Tom Smykowski](https://www.imdb.com/title/tt0151804/characters/nm0726223) told us in the Movie Office Space _"I deal with the god damn customers so the engineers don't have to. I have people skills; I am good at dealing with people. Can't you understand that? What the hell is wrong with you people?"_

So according to Tom, having the engineers talk directly with the users is just not right, so instead a specialist role exists. Sounds simple right? But here is what really happens:

- The BA talks to 'The Business', converts their business speak into tech requirements and places them in a nice document
- The developer picks up the func spec and codes their interpretation
- The tester then picks up the spec and tests the code to the letter of the document
- The developer and tester get into a massive argument
- The BA gets involved and tells them that they are both wrong
- 'The Business' then come along and tell them all that the spec does not reflect what they wanted

And all that is based on the fact that the developer even reads the spec.

Essentially there is a large up front investment which does not involve the right people, everyone then communicates through a document....working away in silos.

## The "She'll be right"

You've all seen this one...the Jira Card with a title and no body!
![Example Mapping](/img/blog/examplemapping/emptyjiracard.png)

The Scrum master/BA/product owner/developer write's down a user story and adds it to the backlog. Nobody writes any acceptance criteria because "It's easy right".

In this scenario, the following usually happens:

- Developer writes the feature they want
- Tester tests the feature they expect
- Argument happens
- Someone FINALLY brings in the product owner and the explain what they actually want

There's always more to the story than meets the eye. Subsequenely the code gets thrown in the bin and story development restarts.

If only there was some way of that short conversation happening between developer, tester and product owner beforehand :wink:

## The Neverending Story

The opposite of the "She'll be right".

Arming the developer and tester with all the information they could possibly want. This often occurs when someone writes a func spec in Given, When, Then syntax and places it into the Jira card to be agile.

Given, When, Then, And Then......And Then And Then And Then

- TLDR - Developer gives up and develops the feature that they want
- Tester tests word for word rather than understanding what it's really supposed to do
- Everyone gets into an argument

In this scenario someone believed they knew the story very well, so documented it in great detail. Unfortunately they forgot to involve the rest of the team.

## So why Example Mapping?

What makes Example Mapping different is the process and the output:

- You get the right people in the room...product owner, SMEs, developers and testers
- You document the understanding of the user story in simple clear terms
- With the above in place, you build a shared understanding
- **EVERYONE** leaves the session knowing they could build & test the feature right now
- The people that build the software build the requirements.....everyone wears the BA hat

<br />

# Examples of Examples

Theres no set rules of how you should structure your examples, it really depends on the user story and rule, the following outlines some examples that I have seen and used myself. It doesn't always have to be the better known Given, When, Then syntax....whilst it works very well in a lot of scenarios its not the only way.

## The Humble Table

Tables are really underated, and they are great for showing examples of certain types of data. I have used tables to represent examples with many sessions I have run for example mapping.

The following table elaborates on our Rule from above 'The discount rate is based off the previous month's after discount cost'

![Example Table](/img/blog/examplemapping/humbletable.png)

One huge advantage of tables is that they are easy to maintain in Excel/Sheets and you can add extra examples quickly during your virtual sessions - _"Yeh but Andrew....what about if Homer......"_

## Fun with Fiction

Adding names to roles can bring a hole load more fun to your example mapping sessions. A product owner once handed the team a matrix showing all the role -> function permissions for the system we were developing. This information was gold, and the team were super impressed with the effort put in, but in an attempt to create a quick reference example to facilitate conversations, we took the matrix and ran through it to create a simple pictorial view we could all talk to!

Here is what our 'Kwik-E-Mart' app membership options might look like as a pictorial view.
![Personas](/img/blog/examplemapping/funwithfiction.png)

## A Simple Sketch

We've all heard the saying "a picture tells a thousand words" right? Well a thousand is a lot for a set of acceptance criteria on a user story but it's still a valid point. Pictures can really help solidify an example on a rule. Consider the feature mentioned above, where users get notified of special offers via the 'Kwik-E-Mart' app. Notifications are obviously time and location sensitive, so the product owner might mention something like "specials should be notified within a 5km range of the store, and only for five minutes". Sounds pretty simple right? But don't people with mobile phones move around during that five minute period. A sketch here can really solidify what the intention is.

![Sketch](/img/blog/examplemapping/sketch.jpg)

<br />

# Common Example Mapping Patterns

The following section shows the various shapes and sizes that example maps might come out of a session like. Each one tells a story of it's own.

## The Stock Standard

A simple story which is easy to understand. This scenario usually leads to a very simple map which has two or three rules each with two to three examples and no major outstanding questions. The team can leave the session and start developing the feature immediately.
![StockStandard](/img/blog/examplemapping/stockstandard.png)

## The Tip of the Iceberg

Session starts with what the team believes is a relatively simple story. Many many questions then get raised, the Product Owner may or may not have answers for them. As more and more rules get clarified and uncovered the team realise this is touching more and more existing functionality, one story becomes many as the impact of this new requriement is uncovered.
![Tip Iceberg](/img/blog/examplemapping/tipiceberg.png)
Whilst this might seem like a negative outcome I believe my response in the session was "Well...at least we know the impact of it now rather than after sinking weeks of effort in". If I recall correctly the product owner also mentioned "That's why we have these sessions".

## The Time Saver

You can sense the nervousness of the product owner coming into this one. They outline what they believe is going to be a big user story with many many complexities. The questions lead to conversations, conversations lead to solutions. The team here end up finding a very simple solution to the product owner's problem, maybe using existing functionality with some small tweaks and backlogging a more elaborate solution for post MVP. A real time saver here for the product owner and team, through the power of collaboration they have realised a real quick win without adding more code.

![Time Saver](/img/blog/examplemapping/timesaver.png)

There's many other examples you will encounter (I sure have), some where the product owner realises that they are not ready to talk about the feature yet, or the team ask that many questions that the product owner declares "I need to go away and think about this". The outcome of the session might not always be an example map to take into developement, it might be the realisation that there is more prep work to do, or that the dev team need to do a technical spike to understand more about how the system currently works and what's possible. In these scenarios and the ones outlined above the one common theme is that by sharing the problem with the wider team and building that shared understanding you set yourself up for success, you might even potentially stop yourselves from embarking on a feature development which is just never going to work.

Mechanical Rock are Australia's only [Cucumber™](https://cucumber.io/) partner licensed to deliver their BDD course. Behaviour Driven Development is a collaborative process that delivers working software, an automated test and an executable specification in a single disciplined process. For more information [get in touch](https://mechanicalrock.io/lets-get-started).
