---
layout: post
title: Taking the Plunger To Your CI/CD Pipeline
date: 2020-08-19
tags: devops ci cd gitflow trunk
author: Matt Tyler
---

The secret to delivering value to your customers faster is ensuring that your path to getting that value out is as lean as possible. The key to unencumbering your pipeline is limiting the amount of time that the next step in your pipeline spends waiting for all the preceding steps to finish. For most software, this means reducing the amount of manual processes involved. This generally manifests itself via waiting for an external approval; examples of which could appear from ceremonial change-management procedures (CAB anyone?), handovers to external testing teams etc.

Rome wasn't a built in a day, and it can be difficult to institute the kind of change needed to deliver better software, faster, in an organisation that has been doing certain things a certain way for years, and has created internal power structures to sustain "how things are done around here". It would certainly be easier to remove the waste on day one it though that may exceed the amount of political capital that a team is willing to spend. An alternative method is to understand the current way of working and try to find a bridge to a brighter future that does not involve significant reconfiguration of critical infrastructure (in this case, your pipelines).

The key to this is ensuring that whatever pipeline you use to deploy to production is as close to the 'final state' as possible. This means you do not encumber the pipeline itself with the opinions of any external processes. Ideally no manual approvals occur between a commit hitting mainline and it reaching production. If you are required to have manual reviews and approvals these occur at the time of a pull-request.

The removal of discrete environments from the pipeline (e.g. the typical test -> stage -> prod cycle) is usually the biggest consequence of this change, and it has positive impacts on the ability to release value quicker. Too often a set of changes gets stuck in one of the environments for a period of time, and this prevents other features from proceeding through the pipeline. Choosing to manage this with source control removes the bottleneck as you are able push independent changes to production ahead of those that are not yet ready.

The argument I often hear is that pushing a "later" change may break a feature that other developers have been working on for awhile, and therefore they should wait for those developers to finish. To them I say, "too bad". Pushing smaller changes frequently increases velocity, and reduces the chance of a conflict later on. Merge conflicts are the consequences we accept when we choose to release a batch of changes together; one group of developers need not pay for the sins of another.

At the core of it - your deployment pipeline should be just for that - deployment. Do not allow your internal processes to creep into the pipeline. Instead think of a model where your environments are 'subscribed' to branches in source control. The head of the branch determines the desired state of the environment. A key to this is selecting an appropriate branching model. I've already warned against using GitFlow, so let's have a look at some alternatives.

## GitHub Flow

On the face of it, I like GitHub Flow. Branches are (at least I think) intended to be short-lived, and there is a strong focus on merging to master. The only thing that I find weird about GitHub Flow is that code is deployed to production before it is merged back into the master branch. They do make a small caveat -

> Different teams may have different deployment strategies. For some, it may be best to deploy to a specially provisioned testing environment. For others, deploying directly to production may be the better choice based on the other elements in their workflow.

I think this a strange practice. I'm not sure how this would work in teams that are deploying the same code to the same environment. My preference would be to merge to master and let the pipeline handle pre-production testing.

## GitLab Flow

I feel GitLab Flow is an improvement over GitFlow and GitHub Flow. It still has some elements of Trunk-Based-Development but diverges in slightly different ways. Where-as in typical trunk-based flows the master or main branch represents the intended state of production, the head of master in GitLab Flow is the state of a staging environment. The head of the main branch must be merged into another branch (typically called 'production') in order begin the deployment process to the production environment. There may also be other environments that are essentially subscribed to the head of a particular branch - escalation to different deployment "stages" is handled by merging between branches.

Of all the branching models that are available, this would probably be the one I'd suggest to a team that was looking to improve their software delivery, but is familiar with GitFlow and reluctant to go to full Trunk-Based Development. That being said, I think we can make some further changes to make the transition to Trunk-Based-Development easier in the future.

# A Flexible Model For Software Delivery Pipelines

Assume we are deploying software-as-a-service. This could be an internal or customer facing service.

1. Customers only consume the service from code that has been merged to the master branch.

2. Features that are ready for consumption are merged to the master branch.

3. We have one pipeline that is 'subscribed' to the master branch.

4. All environments in the pipeline exist for the sole purpose of ensuring that changes do not degrade the customer-facing instance.

5. Developers may create a simplified version of the master pipeline - except there is no final "production" stage, and there is only one pre-production stage that executes all tests against that one environment. There is no automated rollback - developers are expected to fix-forward.

6. UAT, training, and copies of the service exist on their own branches with their own copies of the pipeline subscribed to them. Changes may be merged into these branches before or after they reach master depending on the circumstances.

Illustrated, we might expect this to look something like the following graphic.

<center><img src="/img/manual-gates/model.png" /></center>
<br/>

This has quite a few things going for it.

- We have decoupled environments that have potential manual verification (e.g. UAT) from the path to production.
- There is a clear method for creating additional environments (e.g. UAT, dev) such that they don't impact the path to production.
- It can support different branching models with little impact to any current delivery pipelines that may be in use.
- Decide you don't need additional environments besides pre-prod and prod (e.g. true Trunk-Based Development)? Perfect. Just don't create additional environments subscribed to branches!

The main differences between GitLab Flow and this are:

- The production environment tracks the head of the main branch
- Development teams create short-lived branches for feature development and may subscribe these branches to an ancilliary pipeline
- Development teams may merge into other branches to replicate environment staging, but the final destination is the master branch (as it is in Trunk-Based Development).

# Other Alternatives?

Another model that I've seen reasonably frequent is a pipeline that splits the concerns of building an artifact from its release into an environment. I've heard this referred to as a "split-release" pipeline. One can generally observe this most frequently in teams that are packaging their applications as containers. In this case there isn't an obvious 'subscription' to the head of a branch due to the disconnect between source control and the running environment. There may however be some implicit connection that is configured via triggering the release to an environment when a new artifact is created via the build pipeline. In any case it does not matter to me how continuous deployment happens, just that it does. Not automating the test and release process (instead opting for a manual intervention), is a sure way to increase the risk of the deployment via batching changes together.

# Conclusion