---
layout: post
title: Where do I Stick it?
date: 2020-08-04
tags: aws ssm secrets cloudformation
author: Pete Yandell
---

<!--markdownlint-disable MD036 -->

I was recently working on an application migration project, and the question of where to stick environment specific values came up. These were values that included server names, API keys, database credentials, schema names, etc

This got me thinking, how *do* you determine where to stick these values? It's not always an easy answer when you consider facets such as:

1. Is it a secret or sensitive?
2. Does it need to be rotated on a schedule?
3. Is it re-used across the same AWS account?
4. Does it need to be accessible across AWS accounts?

So to help with the decision making, I’ve created everyone’s favourite; a FLOWCHART!!!

![flowchart]({{ site.url }}/img/where-do-i-stick-it/where-do-i-stick-it.png)

When would you use each location?

[CloudFormation Parameters](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/parameters-section-structure.html)

* The value is not shared; and
* It is not considered a secret nor sensitive; and
* Can be stored in plain text in your source code repository of choice; and
* It does not require regular automatic rotation

[Parameter Store (plain-text)](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html)

* The value is shared within an AWS Account; and
* It is not considered a secret nor sensitive; and
* It does not require regular automatic rotation

[Parameter Store (encrypted)](https://docs.aws.amazon.com/systems-manager/latest/userguide/sysman-paramstore-securestring.html)

* The value is shared within an AWS Account; and
* It is considered a secret or sensitive; and
* It does not require regular automatic rotation

[Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html)

* When the value needs to be shared between AWS Accounts; and/or
* When it is considered a secret or sensitive; and
* When it does require regular automatic rotation

Hope this helps!
