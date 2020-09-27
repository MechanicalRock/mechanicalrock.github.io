---
layout: post
title: Manual Gates, or "GitFlow in a Wig"
date: 2020-08-19
tags: devops ci cd gitflow trunk
author: Matt Tyler
---

Over last few years I've spent a lot of time working in the CI/CD salt mines. The simplest expression of a CI/CD pipeline is depicted below; we begin with pulling the source code, go through to a build and test stage, and deploy to an environment.

<center><img src="/img/manual-gates/simple-1.png" /></center>
<br/>
Most teams will start with this. At some point, the team itself will decide there is too much risk deploying directly to production, and will decide they need an additional environment. Enter the test (or nonproduction, or development, or QC) stage. They put in a manual gate between deployment phases and everything is fine. The pipeline starts to get used in other projects and the world keeps turning.

<center><img src="/img/manual-gates/simple-2.png" /></center>
<br/>
Then a new project comes along, and decides two stages isn't enough. They want another one. It could be for User Acceptance Testing. It could be for training. At any rate it gets shoved into the pipeline between the nonproduction and production stages and the world kicks on; although the teams have noticed that this project does not deploy to production as often.

<center><img src="/img/manual-gates/simple-3.png" /></center>
<br/>
More time passes. Other teams decide they need another environment. Others add other types of verification steps into the pipeline. As they get more and more complicated, the likelihood of code getting through all the way without manual intervention decreases. Frustrated with increasing complexity, teams find ways to circument the pipeline in order to deploy manually. Incidents start to increase in frequency and duration. Engineers moving between teams are frustrated because the pipelines have wildly diverged.

Sounding familiar?

- No-one cares about your pipeline - Forrest Brazeal

I've watched this story unfold multiple times. At the core of the story I've noticed it arises out of a need for two things - manual gating and multiple environments. On the surface both of these things are entirely reasonable options but they seem to result in a productivity death spiral. I've since come to the conclusion that these are tools that one needs to have in their toolbox - the problem stems from how teams choose to implement them. I believe that these two features should be implemented via your branching model, and not via discrete steps in the CI/CD pipeline. Let's first consider the GitFlow branching model.

<!-- Introduction - establish

Set the story - explain the design decision and conversation that led to this - culminating in my deciding that manual gates are git-flow in a wig -->

GitFlow is popular branching model that was first put forward in 2010. It works by maintaining several branches that center around different scenarios; features, releases and hotfixes. It's support for a number of different development scenarios is probably the main contributor to it's continued popularity. A lead developer looking for a branching model is likely to come across GitFlow and several others, and select it because it addresses a number of hypothetical concerns more explicitly then other models.

This doesn't come without cost and teams may find themselves paying for insurance they do not need. The GitFlow branching model is complicated and is reasonably strict about what branches can be merged into what target branch and the circumstances in which this happens. The number of long-lived branches increases, and I've seen less disciplined teams wind up in situations with conflicting versions of a product running on separate branches. This is all fun-and-games until a customer wants feature A and feature B, but these exist in conflicting versions. The only way to avoid this scenario is to dilligently ensure that everything makes it back to mainline as fast as possible. This is a key feature of another model, Trunk-Based-Development, and similar models such as GitHub Flow.

We've made no mystery of our dislike of GitFlow and our preference for Trunk-Based Development. We want to improve the flow of software into production thereby allowing users to get value faster. The way to do this responsibly is to automate as much testing and verification as possible and reduce the number of steps that involve human intervention. This is easiest to obtain when working in the Trunk-Based model. Merging from branch-to-branch-to-branch introduces additional steps that we feel does not add any value to the software development process, as everything should land on master eventually anyway.

But it isn't just us. The creator of GitFlow has somewhat denounced it recently, explaining that it was designed for a world in which consumers typically hosted versions of the software themselves. This is very different from the present where the typical delivery model is via SaaS-based web and mobile applications. The CEO of GitLab has raised similar concerns, and GitHub themselves publish their own methodology which is more in line with Trunk-Based Development. DevOps pioneer, author of the Phoenix Project, and fellow of DevOps Research and Assessment (DORA), Jez Humble, has had similar misgivings about the GitFlow.

 <!-- pointing out that is suboptimal for todays SaaS-based web applications, and other software that is typically deploying in continuous manner. 

(Establish many sources that hate GitFlow - culminating in Jez Humble and the creator of Git Flow calling it unsuitable)

Restate issues with GitFlow like a broken record

Manual gates have many of the same properties & drawbacks as GitFlow -->

Which brings me to the point made in the headline - Manual Gates are functionally GitFlow. If you are attempting to do Trunk-Based-Development, but you have manual gates between stages in your CI/CD pipeline, this is fundamentally the same as GitFlow with merging between environments. In each case someone has to manually inspect the currently deployed environment, decide whether it is healthy, then take some action to promote the software into the next environment. In each case they both have the same impacts on the flow of software into the production environment - waiting for a human to make a decision.

# Are Manual Gates That Bad?

Yes. Sort of. To be honest, manual gates are only bad because 99% of the time they are used to facilitate manual testing. What about the other 1%? I believe the only time a gate is useful is to control when software hits production. You may only want deploy during off-peak times or on certain days for stability reasons e.g. if the software has all the feature it needs for an important event that will happen on Wednesday, it perhaps stands to reason to wait till Thursday before rolling out a non-essential feature.

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

# Improving The Path To Production

It might also seem that I'm agitating for fewer environments in the CI/CD pipeline but this isn't the case. I'm agitating for environments with a purpose behind them, of which the sole focus is ensuring the fastest and safest deployment possible. Let's look at the below evolution of a pipeline.

1. A simple pipeline is constructed that deploys straight to production

<insert image>

2. A pre-production environment is created with a gate, in order to manually verify an environment before it reaches production.

<insert image>

3. The tests that are run during gating are automated, there-by replacing the automated gate with automatic verification.

<insert image>

4. The automated test suite begins to get slower as it both increases in size and complexity. The developers notice that this is due to bootstrapping external resources. The developers create an additional pre-production environment, and split the tests. Tests are run with mocked dependencies against the first pre-production environment, where-as real dependencies are used against the second pre-production environment.

<insert image>

Each of these environments is about stopping faulty or incorrect software hitting production. Concerns such as User Acceptance Testing should not block the path to production - this should have happened before code hit the master branch. Training environments should not be poached from the environments in the main pipeline. If I haven't been clear up to this point, let me restate it - the environments that are present in your main pipeline to production should not have any other function but ensuring that you can reliably deploy code to production that will not cause an unintentional degredation.

To continue that point, I often seem teams that will have a "development" environment in their pipeline. This is a step above developers running entire copies of the system in their local environment, but it still comes with issues. It can be difficult to accurately determine exactly what is running in this environment when multiple developers are deploying changes to such an environment, which can make it difficult to ensure working code is making it's way towards production. This is often ensures that a manual gate is introduced and that it never leaves. If developers must be able to run an isolated copy of the system, it is better to implement this via developer sandboxes or dynamic environments that are free of the pipeline. Recognise that the purpose of such an environment isn't to safely deploy code to production, but to aide the developer in feature development, and as such it doesn't belong in the production pipeline.

# A Flexible Model For Software Delivery Pipelines

Assume we are deploying software-as-a-service. This could be an internal or customer facing service.

1. Customers only consume the service from code that has been merged to the master branch.

2. Features that are ready for consumption are merged to the master branch.

3. We have one pipeline that is 'subscribed' to the master branch.

4. All environments in the pipeline exist for the sole purpose of ensuring that changes do not degrade the customer-facing instance.

5. Developers may create a simplified version of the master pipeline - except there is no final "production" stage, and there is only one pre-production stage that executes all tests against that one environment. There is no automated rollback - developers are expected to fix-forward.

6. UAT, training, and copies of the service exist on their own branches with their own copies of the pipeline subscribed to them. Changes may be merged into these branches before or after they reach master depending on the circumstances.

Illustrated, we might expect this to look something like the following graphic.

<insert image>

This has quite a few things going for it.

- We have decoupled environments that have potential manual verification (e.g. UAT) from the path to production.
- There is a clear method for creating additional environments (e.g. UAT, dev) such that they don't impact the path to production.
- It can support different branching models with little impact to any current delivery pipelines that may be in use.
- Decide you don't need additional environments besides pre-prod and prod (e.g. true Trunk-Based Development)? Fine. Just don't create additional environments subscribed to branches.

# Conclusion

I do get it - writing tests that work well against live environment is hard. It feels like a better use of time in the early stages of a product to instead invest that time in the product itself and maybe it is. However if this is the situation you are in take the time to think tactically and make an informed decision. Review the list of possible ways to introduce automated testing, select what is likely to give you the best return-on-investment, and plan for when the best time to make that investment is. This could be a timeframe (we want to have this in place by the end of the year), when you reach a certain load (we need to consider this when we have 200 daily active users), or when your team reaches a certain size. Ideally teams should focus on reducing friction into production and that can only be achieved by removing steps that require human intervention.




Continuous Integration - code is automatically merged into mainline
- Paired on with no gated review (architectural choices)
- Linting and static analysis
- Automated code-coverage checks - reject if coverage decreases
- Deployed to a dynamic environment - integrations test ran against environment
- Automatically merged to master

Continuous Deployment
- Re-run checks and deploy to environments
- Potential re-use of CI testing


Technical differences
- CI needs dynamic creation of isolated environments (potentially complicated)
- CD tends to require static environments - may deploy to multiple environments (AZ/Regional)


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