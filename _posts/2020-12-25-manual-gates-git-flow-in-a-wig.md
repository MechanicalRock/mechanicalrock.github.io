---
layout: post
title: Manual Gates, or "GitFlow in a Wig"
date: 2020-08-19
tags: devops ci cd gitflow trunk
author: Matt Tyler
---

Introduction - establish 

Set the story - explain the design decision and conversation that led to this - culiminating in my deciding that manual gates are git-flow in a wig

Explain what gitflow is

We've made no mystery of our dislike of GitFlow and our preference for Trunk-Based Development. We want to improve the flow of software into production thereby allowing users to get value faster. The way to do this responsibly is to automate as much testing and verification as possible and reduce the number of steps that involve human intervention. This is easiest to obtain when working in the Trunk-Based model. Merging from branch-to-branch-to-branch introduces additional steps that we feel does not add any value to the software development process, as everything has to land on master eventually anyway.

 (establish company/personal stance on why gitflow sucks)

But it isn't just us. (Establish many sources that hate GitFlow - culminating in Jez Humble and the creator of Git Flow calling it unsuitable)

Restate issues with GitFlow like a broken record

Manual gates have many of the same properties & drawbacks as GitFlow

Which brings me to the point made in the headline - Manual Gates are functionally GitFlow. If you are attempting to do Trunk-Based-Development, but you have manual gates between stages in your CI/CD pipeline, this is fundamentally the same as GitFlow with merging between environments. In each case someone has to manually inspect the currently deployed environment, decide it's healthy, then take some action to promote the software into the next environment. In each case they both have the same impacts on the flow of software into the production environment.

I'm not suggesting developers remove manual gates and leave nothing in their place. Steps need to be taken to add in automated verification to ensure promotion can proceed in safe manner. This typically not very easy to do - hence why a lot of teams tend to fallback on to manual review. But it is neccesary to do so, and I imagine it will become easier as more and more developers become accustomed to integrating it into their pipelines.

What are your alternatives? Automated Verification

Lists of different ways to do it
- CloudFormation CloudWatch Alarms
- CloudWatch Synthetics
- Test Runners (native codepipeline)
- Step Functions / Lambda Functions


/// Notes dump


"GitLab CEO here. I agree that GitFlow is needlessly complex and that there should be one main branch. The author advises to merge in feature branches by rebasing them on master. I think that it is harmful to rewrite history. You will lose cherry-picks, references in issues and testing results (CI) of those commits if you give them a new identifier.

The power of git is the ability to work in parallel without getting in each-others way. No longer having a linear history is an acceptable consequence. In reality the history was never linear to begin with. It is better to have a messy but realistic history if you want to trace back what happend and who did and tested what at what time. I prefer my code to be clean and my history to be correct.

I prefer to start with GitHub flow (merging feature branches without rebasing) and described how to deal with different environments and release branches in GitLab Flow https://about.gitlab.com/2014/09/29/gitlab-flow/" - https://news.ycombinator.com/item?id=9744059

https://www.endoflineblog.com/gitflow-considered-harmful

https://twitter.com/jezhumble/status/1260930170220769283

https://nvie.com/posts/a-successful-git-branching-model/ 

https://mechanicalrock.github.io/2019/07/01/continuous-deployment-the-first-step-on-the-road-to-recovery.html