---
layout: post
title: AWS CloudFormation Time Bomb Detector
date: 2021-03-24
tags: aws cloudformation botocore
author: Tim Myerscough
image: img/blog/botocore-deprecation/comb.png
description:  Do you use Python Lambda backed CustomResources in CloudFormation?  Act before 01 April 2021.  
---

Do you use Python CustomResources in your CloudFormation stacks?  

**If so, you need to act before 01 April 2021.**


## What is the Issue?

You may have already received correspondence directly from AWS but here's your final reminder that if you use Python for CloudFormation Lambda backed CustomResources, then you may need to act before 01 April 2021.

Starting on 01 April 2021, AWS Lambda will no longer support the `botocore.requests` library in Python runtimes.

Any AWS CloudFormation stacks that use the Python runtime for Lambda-backed Custom Resources must be updated to ensure you can continue to maintain your cloud infrastructure. If you do not act now, after 01 April 2021 you will no longer be able to create, update or delete those custom resources.

## Why is this happening?

For more information on the background to the change, please see the referenced blog post[1]

## Am I affected?

Any CloudFormation stacks containing Python-based custom resources must be updated before 01 April 2021.

Using CloudFormation across your AWS estate means this is not a trivial issue.

We have developed a [command line tool][2] to help you identify any impacted resources across your estate.

## How do I fix it?

We have worked examples in the [tool readme][2]

What you must do depends on how you have packaged your [custom resources][3]:

- If you reference `cfn-response` implicitly using inline code using ZipFile: then you need to perform a change to trigger an update (see [this link][2] for an example)
- If you package your Lambda using S3 and manage the cfn-response module yourself, e.g. using AWS SAM, then you must update the cfn-response module to the [latest available code][3]

## Help!

If you need assistance, [**please get in touch**][4]!

<!-- References: -->

[1]: https://aws.amazon.com/blogs/compute/upcoming-changes-to-the-python-sdk-in-aws-lambda/
[2]: https://github.com/MechanicalRock/aws-cfnresponse-checker
[3]: https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-lambda-function-code-cfnresponsemodule.html
[4]: https://www.mechanicalrock.io/lets-get-started