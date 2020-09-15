---
layout: post
title: Having A DevOps Dream
date: 2020-09-11
tags: devops cloudnative product-development product
author: Tim Myerscough
---

<centre><a href="https://devops.games"><img src="/img/devops-dream/DDS_Banner.png" alt=DevOps Dream Banner /></a></centre>

<br/>
In case you hadn't heard, we did a thing! We released [DevOps Dream](https://dream.devops.games/) on 19th August 2020.  I'd like to share our motivations and give some insights behind the scenes.  Along the way, you might just pick up some tips on how you can Live the Dream and beat the game! ;o)

We've been stoked by the response on social media so far. We initially reached out to our network, but have been so happy how it's expanded beyond just the local Perth community:

![Christian Frichot, Hashicorp, said: "Haha, that was fun." and shared score 64%](/img/devops-dream/sm-2.png)

So why did we build it in the first place?

To appreciate why, it helps to understand Mechanical Rock. We are Australia’s leading Cloud Native consultancy based in Perth, Western Australia.  We build awesome Cloud Native solutions for our clients, but we are often unable to share as much behind the scenes as we would like.  We aren't content to just build great software.  We apply [the boy scout rule](https://97-things-every-x-should-know.gitbooks.io/97-things-every-programmer-should-know/content/en/thing_08/) to organisations as well as code.  We have worked hard to build a strong DevOps culture within Mechanical Rock and by immersing clients in our culture, we have been able to accelerate and effect change: real DevOps Transformation!  So we wanted to build something not only to showcase what we can produce, but also something we can use to help people on their own DevOps journey.  

The [practices of DevOps](https://www.amazon.com.au/DevOps-Handbook-World-Class-Reliability-Organizations-ebook/dp/B01M9ASFQ3), and [The Three Ways](https://itrevolution.com/the-three-ways-principles-underpinning-devops/), are well documented.  However, [80% of businesses][1] still have a way to go.  Take automated testing, something I've [written about](https://mechanicalrock.github.io/2018/01/08/high-code-coverage-is-not-yak-shaving.html) in the past.  Despite the clear correlation between organisational performance and automated testing, with high performers automating [27% more of their testing][2], I am still amazed at the low levels of automated testing that we come across.  Despite the evidence, many organisations still struggle with low test coverage.  We wanted to build something that would resonate with people, but also challenge them to think about their own working environment.

As experienced [Behaviour Driven Development trainers](https://www.mechanicalrock.io/learn/), we have seen how effective experiential learning can be, so a game to learn about DevOps through play seemed a great idea - and fun!

![FoodyBrian on Twitter said: Love this game from the team at Mech Rock.  A lot of subtle education going on in the best way possible.  I think these types of ideas have a lot of potential.](/img/devops-dream/sm-4.png)

Our goal was to build something that was quick enough to play in a coffee break, yet had enough depth to make you think and could be used to spark discussion within teams.  And based on the feedback so far, looks like we are heading in the right direction!

![Arne Rossmann on Twitter said: I played it several times.  In the startup it was quite easy. For the other companies, even with more budget, it's much more complex.  I really like it and recommended my colleagues for a playful introduction into DevOps](/img/devops-dream/sm-3.png)

<br/>

## How did The Dream start?

We had been exploring some different options when the spark of building our own game came up.  But with the spark, we needed fuel for the fire.  We regularly [take time away](https://devops.games/pages/improveYourSDO.html#third-way) from our day-to-day projects, in order to learn from each other and work on our own ideas.  So our next team day was the perfect opportunity.

The key to any great game is the engine.  We wanted to build a core with a complex network effect that offered a wealth of opportunities for nuance, coupled with a combinatorial explosion of choices to provide difficulty and replayability.

Our base requirements were discovered early during the morning session:
* The scoring mechanism should be closely aligned with DevOps and Organisational Performance
* Decisions in the form of initiatives (long term planning) and events (short term response) would be the player's actions
* Initiatives and events affect the players metrics over the 3 years of the game

For the game to provide real learnings, it was crucial for a player's decisions, and the resulting effects to be based on real industry insights.  We needed a model that linked practices to outcomes.  The [DevOps Research and Assessment (DORA) Annual State of DevOps Report 2019][1] provided us with an excellent starting point.  It covers the industry data that demonstrates the correlation between the Four Key Metrics with organisational performance along with two detailed research models that link technical and cultural change to organisational performance and productivity.  The Four Key Metrics of organisational performance are:
* **Lead Time** - How long does it take to release changes to production?
* **Deployment Frequency** - How often can you deploy changes?
* **Change Failure Rate** - How often do your deployments go wrong?
* **Time to Restore** - When _bad things_ happen, how quickly can you fix it?

The Four Key metrics are so powerful because they are simple to measure, are strong leading indicators of performance and difficult to game.  Whilst any one metric could be gamed, without the appropriate rigour, other metrics shall suffer.  For example, reducing your lead time by neglecting automated testing and deploying straight to production will likely harm your change failure rate. 

The Four Key metrics provide an excellent barometer to organisational performance and formed the starting point for DevOps Dream.  We expanded our measures to include the impact on your staff and your customers; crucial factors for long term organisational health.  We formed the links between the Four Key Metrics, the research models and our final game metrics:
* **People** - a combination of how happy and capable your team are
* **Productivity** – a measure of how fast and easy it is to change your software services
* **Customer Satisfaction** – a reflection on how changes affect your customers
* **Stability** – a combination of the reliability and predictability of your services

The result was an organised mess of cards and string, covering the positive and negative relationships between various underlying factors and the resulting impact on our game metrics.  Our prototype game engine was born:
![prototype game engine network effects](/img/devops-dream/td-network.jpg)

By the end of the day, we were able to combine our game engine with a storyboard of how the game could flow.
![prototype game flow](/img/devops-dream/td-mockup.png)

How we turned The Dream into a reality is a story for another day....

## So how do I Live the Dream?

I promised you some tips on how you can win at DevOps.

Succeeding at DevOps Dream is about carefully selecting your initiatives and balancing your budget to maximise the effects of your decisions.  Events can be positive or negative - a run of bad luck, and even with an optimal strategy you may struggle to reach the upper echelons: look to minimise the damage and try again next time.
Initiatives give you the levers to pull.  Initiatives cost money, but sometimes the most expensive option isn't always the best.  Some initiatives actually allow you to claw back some much needed funds to invest elsewhere.  Experimentation is key to learn what works and what doesn't work for you.

Within the initiatives and events, we used a combination of our experience and the established research to quantify the impact on various nodes of our game engine network.  When evaluating events, or initiatives, consider the impact on the Three Ways:
* **Flow** - How does your decision help reduce the waste in your delivery process?  Improving flow will reduce lead times and improve deployment frequency.  Improving flow enables your organisation to be agile and deliver value to your customers faster.
* **Feedback Loops** - How does your decision help to improve your understanding of how your systems are behaving and how they are used.  Improving feedback loops means you can plan more effectively allowing you to understand the features that delight your customers the most, or resolve the stability issues holding you back.
* **Continual Improvement** - How does your decision affect your people and the ability of your organisation to continually improve?  Empowering your workforce to experiment, take risks and learn from failure has a multiplying effect on your organisation.

At Mechanical Rock, we are strong advocates for Behaviour Driven Development (BDD).  So let me give you a concrete example.  Consider the benefits of [successfully implementing BDD](https://mechanicalrock.github.io/2017/12/02/the-problem-with-bdd.html):
* **Flow** - Capturing a definition of done up front, you eliminate the waste of [YAGNI](https://www.martinfowler.com/bliki/Yagni.html).  The comprehensive automated specifications the team produce mean you can streamline your delivery pipeline and achieve [Continuous Deployment](https://mechanicalrock.github.io/2019/07/01/continuous-deployment-the-first-step-on-the-road-to-recovery.html).  Up-front discussions help avoid miscommunication, multiple handling and re-work.
* **Feedback Loops** - The discussions between the business and the development team ensure everyone has a common understanding: they all start with the end in mind.  Using concrete examples, teams are able to formulate and test hypotheses in minutes, without the need to write any code

So there we have it, I hope I've given you a bit of insight behind the scenes of DevOps Dream.  We'd love some [feedback](https://docs.google.com/forms/d/e/1FAIpQLSeHge47AcmHexsTkPjpMLq7-dz95kFOctZgDhfsdZDAlt9Yyw/viewform?usp=sf_link).

If you'd like to make your own DevOps Dream become a reality - [let's chat](https://www.mechanicalrock.io/lets-get-started/)!


[1]: https://services.google.com/fh/files/misc/state-of-devops-2019.pdf
[2]: https://services.google.com/fh/files/misc/state-of-devops-2017.pdf