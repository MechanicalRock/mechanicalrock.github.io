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

Which brings me to the point made in the headline - Manual Gates are functionally GitFlow. If you are attempting to do Trunk-Based-Development, but you have manual gates between stages in your CI/CD pipeline, this is fundamentally the same as GitFlow with merging between environments. In each case someone has to manually inspect the currently deployed environment, decide whether it is healthy, then take some action to promote the software into the next environment. In each case they both have the same impacts on the flow of software into the production environment - waiting for a human to make a decision.

I'm not suggesting developers remove manual gates and leave nothing in their place. Steps need to be taken to add in automated verification to ensure promotion can proceed in safe manner and historically this has not been easy to do. It involves diverting expensive engineering effort from feature development to a support function, hence why a lot of teams tend to stick with manual review. But it is neccesary to do so, and I imagine it will become easier as more and more developers become accustomed to integrating it into their pipelines.

What are the tools available to you to perform automated verification of your environments in AWS? It really depends on the primitives you have chosen (containers, serverless, horse and cart etc), but here is a short list to get you started.

### CloudWatch Alarms/Metrics

CloudWatch Alarms and Metrics underpin most of the automated solutions in AWS - think autoscaling groups, rollback alarms, CodeDeploy etc. Having an understanding of configuring of this is crucial to allow you to do more sophisticated automation to recover you systems. After all, you can't respond to an event that you can't observe.

### CloudFormation Rollbacks

Most developers that have used CloudFormation will know that an error during a deployment will cause CloudFormation to rollback to a previous state; fewer seem to be aware that you can tell CloudFormation to monitor an alarm during an update, and rollback the stack if that alarm happens to enter an unhealthy state. If your deployments consist entirely of CloudFormation actions (as they may if you are building serverless applications), this may be a really easy option for you.

### CodeBuild

CodeBuild has great integration with the AWS ecosystem via IAM, can run just about anything you want, and can be triggered in numerous ways (CodePipeline, API call, EventBridge etc). It will also run just about anything you want. CodeBuild can execute almost any set of instructions you may need to in order to validate your environment.

### Lambda

Of course, you may not need all that CodeBuild offers so lambda might be a cheaper/simpler option for you. It integrates nicely with CodePipeline and EventBridge as well, so you could invoke a lambda function post-deploy as a means of performing automated validation.

### Step Functions

15 minutes not enough to execute your tests? Maybe step-functions is more your style. Step Functions can handle long-running steps that may be nessecary for more complicated or lengthy deployments (e.g. DNS validation of certificates).

### CloudWatch Synthetics

CloudWatch Synthetics is a cool, relatively new service that is capable of doing things like generating traffic for test purposes, load-testing, and taking snapshots of web user interfaces like one might do with puppeteer. Whilst it won't handle the whole verify and rollback process, it can be useful for making the verification step more accurate and valuable.



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