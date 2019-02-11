---
layout: post
title:  "Seeds of Inception - Part 7"
date:   2018-09-28
tags: aws codepipeline inception pipeline step functions lonliest state machines
author: Pete Yandell
image: img/inception-pipelines/seed_germination.png
---

**Part 7 planting the seed** - A practical example for DevOps on AWS

## What's The Problem

So as promised at the end of last months post, this post is all around the new shiny AWS CDK. The CDK is all about *record screeeech* ooh look, a **NEW** shiny thing... STEP FUNCTIONS!!!!

As is (hopefully) apparent by now, I got completely distracted by Step Functions. These little beauties allow you do ...

## What are Step Functions?

<div style="float: right"><img style="margin-right:50px" alt="state machine flowchart" src="{{ site.url }}/img/inception-pipelines/part-7-flowchart.png" /></div>

Step Functions are a fully managed worflow engine/state machine that supports logic branching, task parallelisation, error handling and retry behaviours with exponential backoff. A simplie way to think about them is that they are programmable flowcharts. The image on the right is how an example of how Step Functions will render your workflow.

## When would you choose to use Step Functions?

To me, Step Functions really shine in a couple of areas:

- Decomposing a complex lambda into discete parts (Single Responsibility Principle).
- Describing complex or time-based business processes; the Step Function Definition Language allows easy decomposition into discete steps that can then be modfied as required (e.g. moving the order of steps around).

## Why this deviation from the standard Inception Pipeline post?

That's a really good question! So, apart from being really cool and showing off the shinyness of Step Fuctions, I found that the documentation out there a little scattered. Parts of it dealt with the language, parts the different terminonlofy and parts where how to use the Serverless Framework to deploy them. What was missing was a step-by-step breakdown of how it all hangs together.

So that's just what I'll do in this post. From here down I'll discuss how I wrote 'The Lonliest State Machine in the Region'; an exploration of how Step Functions can be used to play Rock-Paper-Scissors against itself.

## What are the key Step Function terms?

Below is a briefly description of the Step Function bits that I used. To read the AWs Documentation [click here](https://docs.aws.amazon.com/step-functions/latest/dg/amazon-states-language-states.html)

- Pass: I think of this as 'no-op'; use it when you need to move to something but don't actually need to do anything. I've used this twice - once as a starting point to to kick off the game and again as a logical place to stop the game.
- Parallel: Quite literally the ability to run a chain of tasks in parallel. I use this here to simulate both players in the game making their choice.
- Task: In the game, this is a lambda function that carries out a task (obvious right?)
- Choice: In conventional programming this is your classic `if` condition. I used this as a contried example of rendering a different results page based on whether the round is a draw or there was a clear winner.
- [Amazon States Language](https://docs.aws.amazon.com/step-functions/latest/dg/concepts-amazon-states-language.html): This is a JSON file that describes the state machines exeuction (ie the code behind the flowchart). When you go the Serverless Framework path, this becomes YAML and is defined in your `serverless.yml` file.

There are a few other features that I didn't use (like handling errors) that I'll leave as homework for you to read up on :)

## Where is the code?

I've put the complete project (Inception Pipeline and everthing) up on [GitHub][todo]

```bash
curl -L https://github.com/MechanicalRock/InceptionPipeline/archive/zzz.zip -o lsm.zip
unzip lsm.zip
cd zzz
chmod +x init.sh
./init.sh
```

## How do you get started with it

What are the interesting bits

- use a lambda to trigger the flow
- naming scheme to tied related SF bits together
- the 'event' instance; its whatever you want it to be an it can change

## Gotchas to watch out for:

1. You can only perform a `Choice` decision if the field exists (todo expand in this)
2. Use context rather than callbacks
3. Parallel execution results in an array, so you need to flatten it

## Links of Interest

In my exploration of Step Functions I came across these links which might be useful. I haven't tested running Step Functions locally but I am super curious how that would work. So if you do give it a go, I'll buy you a coffee so you can tell me.

- https://docs.aws.amazon.com/step-functions/latest/dg/welcome.html
- https://states-language.net/spec.html
- https://github.com/airware/stepfunctions-local#run-lambdas-with-localstack
- https://github.com/vkkis93/serverless-step-functions-offline

# Wrapping Up

blah blah de blah