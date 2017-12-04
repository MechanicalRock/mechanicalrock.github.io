---
layout: post
title:  "High Code Coverage is not Wasted Effort"
date:   2018-01-08
categories: Quality BDD
author: Tim Myerscough
image: img/docker-sibling/docker-network.png
---
Recently, someone asked me what I think about code coverage metrics. They said aiming for 100% code coverage could be considered a waste of effort - since you get diminishing returns.

However, in my opinion, if you hold that view, then you misunderstand what the metric means. You probably either don't write code, or write crappy code. Code coverage is a metric. It is an indicator about quality. But does not itself guarantee quality.

Code coverage is the percentage of lines of code executed during testing. It’s a technical metric to help understand where your risk lies.

If your code coverage metric is 20%, I don't know how good your code is. If I had to guess, I'd say _"probably bad"_. I would lack confidence in touching it. Which will lead to technical debt. You won't have confidence to repay the debt, since you don't know if you've broken anything. I'd be confident in saying that your code will be crappy in 6-12 months time.

If your code coverage is at 100%, I don't know how good your code is. If I had to guess, I'd say _"probably good"_. I would have confidence in changing it and eliminating technical debt. If the [windows remained intact](https://blog.codinghorror.com/the-broken-window-theory/), then in 6-12 months time, I'd be confident in saying that it's much higher quality than the 20% code.

But that still doesn't tell the whole story. It's a metric. An indicator. You need to read the story behind the headline. A team that is rewarded by achieving high code coverage, or punished by low coverage, will game the system. Writing pointless, or ineffective, tests in order to push up the stats.

A team with 100% code coverage isn't unnecessarily wasting effort. Disciplined TDD practitioners know exactly what their code currently does (and does not) do. They have made a decision on the functionality that the code shall demonstrably support. And there is no extraneous code. It does nothing more than it is designed to do. That doesn't mean that there are no limitations. The code may do no error handling and only cover the happy path. That wasn't an omission - it's a conscious decision. It's not currently supported. We haven't got to it yet. It's MVP.

Code can have 100% coverage and just do the wrong thing.

In order to understand the story behind the metric, then you need to take the time to understand the situation. To understand the quality of an application - you need to look at the code. In order to understand the effort that’s gone into writing it - then ask the author.

> "Code comments are a source of mis-information” - Clean Code - Robert C. Martin

I say:
> _"Untested code is a source of unnecessary risk". Tim Myerscough_

You should probably reduce the risk by just deleting it.
