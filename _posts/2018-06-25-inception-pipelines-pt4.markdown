---
layout: post
title:  "Seeds of Inception - Part 4"
date:   2018-06-25
tags: aws continuous deployment codepipeline codebuild inception pipeline
author: Pete Yandell
image: img/inception-pipelines/seed_germination.png
---

**Part 4 seeding a forest** - A theoretical example for DevOps on AWS

![forest of trees]({{ site.url }}/img/inception-pipelines/part-4-trees-lotsa-trees.png)

## What's The Problem

In this instalment we'll be stepping back (or is it climbing up) and looking at how an Inception Pipeline fits into the forest of AWS Accounts that most organisations have. Firstly, I'll cover off what every AWS account needs (regardless of what it's used for). Next, I'll briefly discuss the common accounts that everyone should have. We'll then finish up with a few ideas on combining accounts and pipelines.

## What Technologies Are We Going To Use

None, nada, zero, zilch. So, put away the IDE, shutdown the AWS Console and brew up your favourite caffeinated beverage. This instalment is pure reading and thinking.

## What Are The Prerequisites

Not much this month. If you've read [Part 1]({{ site.baseurl }}{% post_url 2018-03-01-inception-pipelines-pt1 %}) then that's pretty much it.

## How It All Works

What follows from here is my opinionated view of how Inception Pipeline fits into:

* Any AWS account, no matter what the account's purpose is.
* How you should create a suite of common / shared accounts.
* And finally, three ideas on how you can manage something called an *aspect*.

The ideas discussed in this post also fit alongside the [AWS Landing Zone](https://aws.amazon.com/answers/aws-landing-zone/) solution for managing multi-account AWS environments.

**Note:** When writing this post, I struggled to find a simple, generic, way of what an Inception Pipeline does in each of the use cases below. Terms like product, feature, service, etc just didn't cover all the possible scenarios. The best term I could think up was *aspect*. Hopefully the term *aspect* makes sense (or soon will), so let’s get started!

### What Every AWS Account Needs

![account and aspect pipelines]({{ site.url }}/img/inception-pipelines/part-4-what-every-account-needs.png)

The above diagram represents a very strong opinion that I have, which is that every AWS account must have at least two Inception Pipelines.

The first pipeline performs actions and manages the state of the account (aka the account-level pipeline). The obvious items here are things like IAM users/groups/roles/etc, account wide KMS keys, Route 53 hosted zones, etc. The idea here is anything that changes stuff at the account level is kept together in this pipeline. I would also say it is typically the slower changing items; created once then never really change.

The second, and subsequent, pipeline is for doing stuff within the account; they are an *aspect* of why the account exists in the first place. For example, if the account is for hosting a static website, this is where you put in all the CloudFormation code for configuring CloudFront, S3 buckets, Route 53 domain entries, etc. These items are more likely to have constant change and/or be more transient in lifespan. Another way to think about these is that they are aspects that you want to delete (with the pipeline) but not delete the account.

### What Every Organisation Should Have

![aws accounts]({{ site.url }}/img/inception-pipelines/part-4-what-every-organisation-needs.png)

#### Root AWS Account

AWS accounts follow a tree like structure where an account can have zero to many child accounts. At the very top of this hierarchy is the root account. This account should be one of the most locked down accounts you have in the tree, both in terms of what people can do and the AWS services that are run inside it. Ideally, in here there is only a single Inception Pipeline which is used to manage things which are global.

A perfect use case here is defining IAM users that can assume roles in other accounts. This gives you the following benefits:

1. Centralised management of IAM users. If someone starts or leaves your organisation, you can add or delete them from a single location rather than hunting through all your other AWS accounts.
2. Centralised management of permissions. You define an IAM Group in the root account that can then assume a role in a child account. So, if the child account defines an Administrator role, you match that with a group here and then add/remove IAM users as required.
3. All changes to your IAM users and groups are managed as code. This gives you a minimalistic audit trail of who made changes.

Next month's post will expand upon how to configure and use cross account roles.

One last consideration to keep in mind is that with users only being created in the Root Accouint are the [IAM Service Limits](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_iam-limits.html#reference_iam-limits-entities). These limits only becomes an issue when you literally have thousands of users, in which case you'll be better off using a Single SignOn Identity Provider (because your root account now only contains roles to assume).

#### Audit AWS Account

This account is where all things security and audit-ty related go. The account-level Inception Pipeline would define three IAM roles:

* A heavily controlled **Administrator** account. Once defined, it would only need to be used in the case of emergency to perform actions (most likely in the AWS Console itself).
* A more open role that can be assumed to make changes via the other pipelines. Called something like **SecurityOwner**?
* Finally, a read-only role that can be given to developers, auditors, etc to view logs and other files stored in this account and could be called something like **SecurityReviewer**.

Depending on your requirements, you will then have one (or more) pipelines which define things like:

* the S3 bucket(s) for CloudTrail (in your other accounts) to store events.
* Definitions for data retention.
* CloudWatch Alarms for CloudTrail events.

#### Shared Services AWS Account

Your shared services account defines all the aspects that your other accounts consume but are not allowed to manage. For example, you'll have the standard account-level Inception Pipeline to managed IAM roles. You might then, as an organisation, want to centralise the management of Route 53. So, you would create another pipeline to manage the creation of Route 53 hosted zones and records sets.

Other shared service ideas include:

* [Direct Connect](https://aws.amazon.com/directconnect/)
* [Service Catalog](https://aws.amazon.com/servicecatalog/)
* [VPC Endpoint Services (AWS PrivateLink)](https://docs.aws.amazon.com/AmazonVPC/latest/UserGuide/endpoint-service.html)
* [API Gateway Private Integrations](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-private-integration.html)

The last two points make it easier and safer for a service from the Shared Service account to be consumed by VPC's in other accounts through VPC Peering.

#### Sandbox AWS Account

The Sandbox AWS Account is used by developers as a safe place to try out all the services that AWS provides. It is a volatile landscape with lots of things being created and destroyed all the time. Developers should have full organisational and AWS permissions here to experiment. To help prevent cost blowouts, AWS Budgets should be used to alert when the forecasted, and actual, spend hits predefined levels.

It is also possible to define a Lambda in the root account that periodically deletes the Sandbox account and recreates it in a clean state.

The account Inception Pipeline defines the roles that can be assumed, as well as setup AWS Budget alerts. When people are experimenting, they would have their own copy of the pipeline.

### Managing Aspects

Now we move into the interesting bits and answer the question "How do I structure my accounts/pipeline for my application?".

#### All-In-One

![cross account components]({{ site.url }}/img/inception-pipelines/part-4-all-in-one.png)

In this model we just have a single AWS account with all the 'environments' living inside this one account. In here there is the usual account-level pipeline, and then at least one pipeline per aspect.

Pros:

* Everything is in one place making it easy to see where everything is and what the status is.
* Deployments are potentially easier since you don't have to worry about crossing AWS account boundaries.

Cons:

* Everything is in one place so if your account is compromised then the blast radius is huge.
* It would quickly become crowded and harder to manage resource name collisions.
* Easy to make a mistake and accidentally delete Production resources.
* While it is possible to network segregate environments using VPC subnets, they are subjected to the Account Service Limit, and is also just plain harder to find stuff.

#### Production / Non-Production

![cross account components]({{ site.url }}/img/inception-pipelines/part-4-prod-non-prod.png)

This model separates out the Production environment into its own AWS account.

Pros:

* If Non-Production is compromised, then Production is still safe.
* Still has the quick feedback cycle on change to Non-Production environments as where you build the code is also the same AWS account that you run in.
* Using new AWS services is easier as you don't need to adjust permission in multiple AWS accounts.

Cons:

* When you deploy into Production, it is a different process (i.e. cross account boundaries), so the chance for something to go wrong increases.
* It can get noisy in the same way that 'All-in-one' does for the Non-Production environments.
* Getting the cross-account permissions can be challenging.

#### Environments For Everyone

![cross account components]({{ site.url }}/img/inception-pipelines/part-4-environments-for-everyone.png)

In the final model, we split building the code into its own AWS account, and have one AWS account per environment.

Pros:

* Very clean separation of build vs running code.
* Environments can progressively become more locked-down/restrictive on who can see/do what.
* Environments no longer become snowflakes. Since every environment is built from the same configuration (see [Part 3](https://blog.mechanicalrock.io/aws/continuous/deployment/cdn/spa/cloudfront/cross-account/2018/05/18/inception-pipelines-pt3) in this series), there is no 'it worked in TEST but not UAT because ....'
* If you need a new environment (for example to host a special version) then it’s just another stage in your pipeline.

Cons:

* More complicated to setup initially.
* Can result in AWS Account sprawl; if you have three applications (aspects) and four environments; 3 * 4 = 12 AWS Accounts to manage.

## Where Do I Get The Seed Files

No new files this month. If you're keen to plant an Inception Pipeline in your account, pop across to [GitHub repo and grab the files from there](https://github.com/MechanicalRock/InceptionPipeline/tree/master).

## Taking It For A Spin

If you're unsure where to start, and you thought you could skip reading [Part 1](https://blog.mechanicalrock.io/aws/continuous/deployment/2018/03/01/inception-pipelines-pt1), I highly recommend starting there.

I'm also quite susceptible to bribery by coffee, so if you'd like that chat drop me an email at [contact@mechanicalrock.io](mailto:contact@mechanicalrock.io) and ask for **Pipeline Pete**.

## Wrapping Up

Hopefully this post has planted some ideas on how to tame your organisation's AWS Account jungle. Stay tuned for next month where I expand upon how to define and manage cross account IAM users and roles. You'll even get some code snippets to try out at home!

And finally, a big shout out to Will Sia for some excellent advice while writing this post!
