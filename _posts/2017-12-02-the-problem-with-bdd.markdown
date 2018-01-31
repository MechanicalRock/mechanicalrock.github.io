---
layout: post
title:  "The Highs & Lows of BDD"
date:   2017-12-02
categories: bdd quality
author: Hamish Tedeschi
image: img/bug_with_lens.png
---

We, as a [company](www.mechanicalrock.io/), have been reflecting a lot recently on the success and failure of Behaviour Driven Development (BDD) at various clients and/or projects. We've had numerous discussions (some heated) about things which we each believe contribute to either its success of failure. We've discussed the symptoms which cause pain, but, the one thing we keep coming back to, in cases where it wasn't adopted or there was limited benefit, was that it wasn't seen as valuable by *developers*. The simple fact of the matter is, BDD is a software development process aimed at bridging the gap between technical and non-technical stakeholders. But you can't develop software without developers, so if they aren't bought into it, it will not succeed.

But why? Why is it on these occaisions that the developers were not interested in adopting BDD or seeing it succeed? From experience, I think there are 3 reasons, which grouped together provide a strong argument as to why BDD can fail:

1) *Testing.* In the nineties and the early noughties we saw an explosion in the testing industry. Massive testing teams were formed which reviewed products in phases like System Testing, System Integration Testing and User Acceptance Testing. These were the late waterfall days where teams spent months creating requirement documents and detailed specifications. Testers in these teams, searching to provide value, looked to automate repetitive tasks. Testing tools sprung up left, right and centre - especially ones advocating low-code or no-code features, which (allegedly) meant testers didn't need programming skills. Suddenly, test automation became the realm of the testing team and was no longer a programming activity. 

***Newsflash > Test automation is software development. Vendors which tell you otherwise are lying to you. Testing remains an important discipline and skill, but having dedicated testers on a project can actually detract from a products quality. We have begun advocating for the removal of dedicated testers on teams - at least internally we do not have dedicated testers. ***

2) *Developers.* Developing software test first requires a mindset shift. As an industry, we don't teach our future programmers how to write tests and THEN implement systems from those failing tests. This is a huge problem. I'm continually amazed how little practical skills developers coming straight from University have. They use out of date programming languages (Java 5 anyone?) and don't know anything about things like Amazon Web Services (AWS), let alone Test Driven Design (TDD).

***Newsflash > If you don't teach our next generation of programmers to care about quality or give them the tools to understand if what they built is actually correct, then don't expect them to be able to pick it up years after the fact..***

3) *Project Leaders.* BDD has a perceived slowness to it. It is actually a falsehood when done as a programming activity (rather than a testing one). But, at the start of a project, people are looking for reasons as to why projects are moving slowly. Few people account for the natural progression of things, instead they look for something or someone to blame. As BDD is the new thing the team is adopting, that becomes the easiest to blame. Strong technical leaders are required to set the course and also provide the buffer for the team to be able to experiment and have the time to properly assess what works for them, or not.. BDD is not a silver bullet, but it also shouldn't blamed for slow delivery.

***Newsflash > Worrying about project timelines is fine, I get it. But we need to think more about longer term goals than short term wins. Sometimes the Agile mentality can feel like this runs contrary to that. The times where BDD has worked, there has been a strong technical leader who has given the team the space to experiment, learn and succeed.***