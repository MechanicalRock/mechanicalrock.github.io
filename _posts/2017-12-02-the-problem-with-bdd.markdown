---
layout: post
title:  "The Problem With BDD"
date:   2017-12-02
categories: bdd quality
author: Hamish Tedeschi
image: img/bug_with_lens.png
---

We, as a [company](www.mechanicalrock.io/), have been reflecting a lot recently on the success and failure of Behaviour Driven Development (BDD) at various clients and/or projects. We've had numerous arguments about things which we each think make it hard. We've discussed the symptoms which cause pain. But, the one thing we keep coming back to, in cases where it wasn't adopted or there was limited benefit, was that it wasn't seen as valuable by *developers*. The simple fact of the matter is, BDD is a software development process aimed at bridging the gap between technical and non-technical stakeholders. But, **it is** a software development process. So, if the developers aren't bought into it, it cannot succeed. **Period.**

But why? Why is it that developers aren't interested in adopting BDD or seeing it succeed? I think there are a number of reasons, which grouped together provide a strong argument:

1) *Testing.* In the nineties and the early noughties we saw an explosion in the testing industry. Massive testing teams were formed which reviewed products in phases like System Testing, System Integration Testing and User Acceptance Testing. These were the late waterfall days where teams spent months creating requirement documents and detailed specifications. Testers in these teams, searching to provide value, looked to automate repetitive tasks. Testing tools sprung up left, right and centre - especially ones advocating low-code or no-code features, which (allegedly) meant testers didn't need programming skills. Suddenly, test automation became the realm of the testing team and was no longer a programming activity. 

***Newsflash > test automation is software development. Vendors which tell you otherwise are lying to you. I'm sure I can find a lovely bullshit Gartner quadrant advocating the leaders in test automation. I wonder how much it cost to get their name in there..***

2) *Developers.* Developing software test first requires a mindset shift. As an industry, we don't teach our future programmers how to write tests and then implement applications from those failing tests. This is a huge problem. I'm continually amazed how little skills developers coming straight from University have. They use out of date programming languages (Java 5 anyone?) and don't know anything about things like AWS, let alone TDD.

***Newsflash > if you don't teach programmers from the beginning to care about quality or give them the tools to understand if what they built is actually correct, then don't expect them to be able to pick it up years after the fact..***

3) *Project Leaders.* BDD has a perceived slowness to it. It is actually a falsehood when done as a programming activity (rather than a testing one). But at the start of a project, people are looking for reasons as to why projects are moving slowly. No one accounts for the natural progression of things. In actual fact the nature of it is to look for a reason. Something to blame. As BDD is the new thing the team is adopting, that obviously cops the blame.

***Newsflash > worrying about project timelines is fine, I get it. But have some guts. Stay the course for fucks sake..***