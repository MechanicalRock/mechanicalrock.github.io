---
layout: post
title:  "Seeds of Inception - Part 5"
date:   2018-07-18
categories: aws codepipeline inception pipeline iam cross-account roles users groups
author: Pete Yandell
image: img/inception-pipelines/seed_germination.png
---

**Part 5 access all accounts** - A practical example for DevOps on AWS

![vines]({{ site.url }}/img/inception-pipelines/part-5-vines.jpg)

## What's The Problem

This month we're going to build on last month's post and discuss one approach to managing IAM users by avoiding the quick, dirty (and lazy) way of throwing IAM users into each account. If you did, you'd quickly end up with an unmanageable jungle of profiles and access keys, which creates an increased exposure to compromised accounts. There is a better way, so read on fair explorers while we cut a path through this jungle to IAM user nirvana.

It is worth explicitly calling out that the ideas discussed below are more targeted towards smaller AWS installations. If you're working in a large corporate environment with a dedicated User Directory and tens or hundreds of AWS Accounts, then there is a better way. Reach out to discuss how our Cloud Native Platform can transform!

## What Technologies Are We Going To Use

This month is all about IAM; specifically, how to create a single IAM user in your root account and then use cross-account roles to perform developer actions in your child account.

* [IAM](https://aws.amazon.com/iam/)
* [IAM Users](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users.html)
* [IAM Groups](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_groups.html)
* [IAM Roles](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)

## What Are The Prerequisites

Ideally, you'll have two accounts to try this in, however a single account with two pipelines should work fine. The advantage of using two accounts is being able to clearly see the permission separation in action.

## How It All Works

This post is a working example of how you can manage developer access to your child accounts. In the real world you would also have a 'break-glass-in-case-of-emergency' admin role. The same exact pattern can be applied; just copy-and-paste, change the names and adjust the policies to suit. I'll leave that as an exercise for the reader.

The diagram below shows how a developer role, developer group and a developer user all hang together. It's worth calling out that I've separated out the IAM Policy from the Role/Group. My reasons for this are:

* Keep the concerns of each separate (what the permissions are vs who has them)
* Allows reuse of the policies if desired.
* Policies can be reused internally without the cross-account assumption clause being included.

![iam users groups roles]({{ site.url }}/img/inception-pipelines/part-5-users-groups-roles.png)

### Child Account

The child account owns what developers can perform inside of it, which is does by defining IAM roles that can be assumed by the root account. In the example code, it does this by this snippet in child/aws_capability_iam.yml:

```yaml
Statement:
  - Action: ['sts:AssumeRole']
    Effect: 'Allow'
    Principal:
      AWS:
        - !Sub 'arn:aws:iam::${ParamRootAccount}:root'
```

Also in the same file is the DeveloperPolicy document which outlines what the developer can do. In the example code, the developer can manage the Inception Pipeline, view logs, read from S3 buckets and that's about it.

### Root Account

The root account is the central location for managing IAM users and what they have access to. The file root/aws_capability_iam.yml defines an IAM Group (with matching IAM Policy) that can assume the DeveloperRole in the child account. Depending on your use case (number of accounts, developers, etc) you could just define a single group that has access to all your child accounts. or define a Group-per-Account. It's up to you.

The final file is root/aws_capability_iam_users.yml. In this file you create your IAM User and then assign them to all the Group(s) that they need. If the developer leaves the company, simply delete the IAM User and any group assignments and redeploy. Within a minute they will no longer have any access. Alternatively, you can just remove them from the Group(s) if it's a temporary change e.g. long service leave.

## Where Do I Get The Seed Files

Two complete, working pipelines are available here on GitHub, one pipeline for your root account and one for your child account. With reference to the last post, these would be considered account-level pipelines.

### What Are The Files

|File|Description|
|----|-----------|
|child/aws_capability_iam.yml | Defines the DeveloperPolicy and DeveloperRole. DeveloperRole is the role that is assumed by your developers from the root account.|
|root/aws_capability_iam.yml | Defines the ChildDeveloperPolicy and ChildDeveloperGroup.|
|root/aws_capability_iam_users.yml | Defines the IAM User (in this case DeveloperPete) and assigns them to the ChildDeveloperGroup|

## Taking It For A Spin

If you're new to Inception Pipelines, head on over to the original post and set yourself up a pipeline. If not, copy over the files referenced above, add in the appropriate pipeline action and commit. Enjoy!

## Wrapping Up

And so, another month closes with another awesome Inception Pipeline post.
