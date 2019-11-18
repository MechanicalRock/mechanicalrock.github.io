---
layout: post
title:  "Serverless to Observerless: How it was"
date: 2019-11-19
tags: latencyconf aws codepipeline lambda apigateway xray serverless
author: Pete Yandell
image: img/inception-pipelines/s2o-how-it-was/banner-heading.jpg
---

## The Lead Up

![Latency banner]({{ site.url }}/img/inception-pipelines/s2o-how-it-was/banner-heading.jpg)

On Friday 15th November, I was lucky to present my talk "Serverless to Observerless" to approximately 300 people at the  [State Theatre Centre of WA](https://www.ptt.wa.gov.au/venues/state-theatre-centre-of-wa/). When I realised that my talk had been selected my initial reaction was "YAY, AWESOME!!". Then it quickly turned to "Oh no!" when I realised that:

* I've never successfully presented it without technical issues; and
* It typically took 45 minutes to delivery (I only had 25); and
* It was right before afternoon coffees when everyone is sleepy; and
* It was usually delivered in an interactive manner which wouldn't translate to the theatre.

Oh, and that it was likely to be recorded for posterity!

Still, I'm never one to shy away from a challenge, so I knuckled down and got to work.

## A little background

![Pete thinking face with banner]({{ site.url }}/img/inception-pipelines/s2o-how-it-was/banner-thinking.jpg)

Let me start with some background. I have previously presented versions of it to several meetups across Australia (as well as internally to a few select groups). Each time I've presented it, something had gone wrong; from using the wrong AWS account, conflicting AWS resources that hadn't been properly removed from past presentations to just flat out technical issues connecting to AV equipment. So, task #1 was making sure I had a run sheet to make sure those possibilities were taken care of.

Next step was to sit down and just write the story of what I wanted to tell. I strongly believe that every time you get on stage, you're there to tell a story. People love stories and quite often remember the storytelling rather than the content. Plus, not many people like long, droning lectures. The act of just sitting down and writing the story meant I could focus on setting the stage, building up towards the climax and finally wrapping it all up in the conclusion.

My talk is a live-code presentation where I take the audience on a journey through what is possible on AWS for Serverless applications. It is a breadth-not-depth, infrastructure-as-code presentation where I start from nothing, deploy an application (including all CI/CD infrastructure) into the cloud and then promptly turn around and try to burn it to the ground.

After getting my story straight, I spent many hours talking to myself reading out the story and refining it. I can only image what people around me thought!! Still, it was invaluable as from here I was able to distil it all down to a bunch of index cards with the points I wanted to cover. It was also invaluable in helping me in timing parts of the talk. Remember, it is a live-coding presentation so knowing where I need to add 'filler' and where to wrap things up was key. I couldn't face the horror of standing in front of 300 people, crickets chirping, having nothing to say while I waited for the code to catch-up. A bonus was that continually presenting it helped immensely in ironing out all the sharp bits that kept poking me; I have confidence the code would deploy and run smoothly without errors and in the allocated time.

## On the Day

![Pete freaking face with banner]({{ site.url }}/img/inception-pipelines/s2o-how-it-was/banner-freaking.jpg)

Last year at [Latency 2018](https://www.latencyconf.io/#/pastconferences), I presented a lightning talk called "Implementing AWS X-Ray in your lambdas in less than 5 minutes, with cheat sheets!" to approximately 200 people. The talk went quite well, and I wasn't nervous beforehand, partly because I had a cold and couldn't see the crowd. But this year it felt soooo much different!! Check out the crowd below!

![The crowd]({{ site.url }}/img/inception-pipelines/s2o-how-it-was/banner-crowding.jpg)

15 minutes beforehand, I had run my run sheet up, everything was primed and ready and I was just counting down. Tick tock, tick tock, tick tock. Finally, I was ready to go! Up I jumped, plugged in my laptop and it was show time. A special call out, and thank-you, to Min for the fantastic introduction.

I feel I got off to a pretty good start and covered almost all the points that I wanted to cover in my introduction. The first hurdle that I needed to cross was getting my code seeded and building in AWS. I was a little ahead of schedule and needed a little bit ad-libbing, but everything was going well. The next hurdle was running the game and again everything operated smoothly. The final hurdle was my downfall. This hurdle was where I ran a load-testing tool that was supposed to overload the game. Except it didn't. Turns out I just didn't have enough bandwidth to kill it. What I needed from past runs was about 6-7000 hits within 3 minutes; and I managed to just get to 3000.

The Demo Gods failed me by not failing me. Sigh.

## Curtain Close

![Pete blinking face with banner]({{ site.url }}/img/inception-pipelines/s2o-how-it-was/banner-blinking.jpg)

In reflection, how was it presenting to 300 people? It was a blast!! My personal philosophy in life is that if something seems scary to you then you should just do it! And I'm very glad I did.

Right before I wrap up this post, I want to thank the Latency organising committee for selecting me and giving me the opportunity to present. I believe the speaker videos will be up on the [Latency website](https://www.latencyconf.io/#/) soonish if you missed me at Latency, or just want to rewatch me in glorious action. And if you want to see the code, it's up on [GitHub here](https://github.com/mechanicalpete/serverless-to-observerless).

As always, reach out if you'd like and coffee and a chat!
