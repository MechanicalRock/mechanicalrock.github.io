---
layout: post
title:  "re:Invent 2019 Recap"
date: 2019-12-06
tags: aws reinvent recap
author: Nathan Glover
image: /img/blog/reinvent-2019-recap/reinvent-opener.png
---

## Introduction

{:refdef: style="text-align: center;"}
<img src="/img/blog/reinvent-2019-recap/reinvent-opener.png" width="700">
{: refdef}

re:Invent 2019 is the largest Amazon run event that occurs yearly in Las Vegas. Since 2011 it has been progressively scaling up in size and this year I was lucky enough to be able to attend for the first time.

I'm sure many readers have filled themselves in on the announcements remotely; however as someone who; in 2018 tried to digest what releases were *important*; I've decied to put together this post outlining the things that stood out to me.

### Fargate

{:refdef: style="text-align: center;"}
<img src="/img/blog/reinvent-2019-recap/reinvent-fargate.png" width="700">
{: refdef}

When fargate launched at re:Invent 2017 there was a lot of excitement from anyone who had been running container workloads. Fargate allowed developers to freely scale their workloads **UP** and **OUT** with very minimal configuration and only pay for the time those containers were actually running.

A few years later and developers have been looking at Fargate for more features, and we were lucky enough this year to see a few of these launch!

#### [Fargate for EKS](https://aws.amazon.com/blogs/aws/amazon-eks-on-aws-fargate-now-generally-available/)

{:refdef: style="text-align: center;"}
<img src="/img/blog/reinvent-2019-recap/reinvent-fargate-eks.png" width="700">
{: refdef}

Kubernetes has grown in popularity a lot over the last couple years, however there's a lot of overhead required to manage a Kuberenetes cluster; and this overhead has become just another thing developers need to learn in order to deploy their applications.

Fargate for EKS is potentially a solution to this hurdle, allowing developers to deploy containers to EKS through Fargate.

#### [Fargate Spot Instances](https://aws.amazon.com/blogs/aws/aws-fargate-spot-now-generally-available/)

If you aren't familiar with Spot pricing then your wallet might become a lot happier after reading this. Spot instances in the context of EC2 is compute that can be taken away from you at any point in time, meaning that applications running on spot need to be interruption tolerant. The benefit however is you'll recieve a discount of up to 70% by running spot.

Fargate Spot instances offer the same opportunity, however with your container workloads instead. You can setup a spot cluster by simply selecting spot under Instance Configuration.

{:refdef: style="text-align: center;"}
<img src="/img/blog/reinvent-2019-recap/fargate-spot-instance.png" width="700">
{: refdef}

### SageMaker

re:Invent 2019 had a lot to offer in the machine learning & AI space whith most notable entries coming in under the existing [SageMaker](https://aws.amazon.com/sagemaker/) suite.

#### [SageMaker Studio](https://aws.amazon.com/blogs/aws/amazon-sagemaker-studio-the-first-fully-integrated-development-environment-for-machine-learning/)

{:refdef: style="text-align: center;"}
<img src="/img/blog/reinvent-2019-recap/reinvent-sagemaker-studio.png" width="700">
{: refdef}

SageMaker Studio was an exciting announcement as it marks a huge jump forward for the existing notebook platform AWS had to offer. SafeMaker Studio presents itself as a single pane of glass for all ML workflows, and it isn't lying about that.

In the past I've had critisism for the lacklustre effort put into making SageMaker as useful as the competitions offerings (Google Notebooks, JupyterLab). Most of my personal problems came from:

* No way to change instance type under notebook without shutting down experiments
* Very lacking visualization / graphing capabilities
* Model debugging & monitoring (couldn't easily run tensorboardX)

Luckily all the capabilities above (and more) are supported in SageMaker Studio.

#### [SageMaker AutoPilot](https://aws.amazon.com/blogs/aws/amazon-sagemaker-autopilot-fully-managed-automatic-machine-learning/)

{:refdef: style="text-align: center;"}
<img src="/img/blog/reinvent-2019-recap/reinvent-autopilot.png" width="700">
{: refdef}

Auto ML has been available on competing clouds for a while now ([Custom Vision AI](http://customvision.ai/), [Cloud AutoML](https://cloud.google.com/automl/)) so it was expected that AWS would be launching their own player in the ring.

The idea behind **Auto Machine Learning** is that you are able to upload bulk data and with minimal direction on what features and characteristics you would like to see, the platform should be able to create a general model for you. It is usually very useful for quickly validating problems as it can setup some simple ML experiments for you without too much engineering work.

SageMaker AutoPilot took this existing idea and (hopefully) has improved on it with a number of extra features like:

* Automatic hyperparameter optimization
* Easier distributed training
* Better algorithm selection for different data types and problem scopes:
  * Linear regression
  * Binary classification
  * Multi-class classification

### [CodeGuru](https://aws.amazon.com/about-aws/whats-new/2019/12/aws-announces-amazon-codeguru-for-automated-code-reviews-and-application-performance-recommendations/)

{:refdef: style="text-align: center;"}
<img src="/img/blog/reinvent-2019-recap/reinvent-codeguru.png" width="700">
{: refdef}

CodeGuru is an automated; machine learning backed code review system that was built from internal code review data within AWS.

The service has a lot of potential at face value, however there are a couple caviets to it currently:

* $0.75 per [100 lines of code](https://aws.amazon.com/codeguru/pricing/) scanned per month
* Java support only
  * Due to the profiler requiring code to be put into your application, a custom SDK needs to be written for each language

These are two major drawbacks to the service, so I'm hoping it gets cheaper and supports more languages in the very near future.

### Amazon Kendra

{:refdef: style="text-align: center;"}
<img src="/img/blog/reinvent-2019-recap/reinvent-kendra.png" width="700">
{: refdef}

Enterprise search is a hot trend that's beginning to pop up lately. Search functionality which is comparable to Google could allow for more intuitive way for users to discover contextually relevant data within their enterprise domain.

This is where [Amazon Kendra](https://aws.amazon.com/kendra/) could be revolutionary; so I'm excited to give this serivce a try.

It should be noted that the service is not cheap, and only the Enterprise edition ($7.00 per hour) is available currently. This is likely due to Kendra being built ontop of a pretty expensive at scale indexing engine (Elasticsearch most probably), so costs are passed onto us for running a cluster.

### Notable Entires

Since this list was very bias towards things that stood out to myself, I'll drop some links below to other services that are definitely also on my radar.

* [AWS Local Zones](https://aws.amazon.com/about-aws/global-infrastructure/localzones/) & [Outposts](https://aws.amazon.com/outposts/)
  * As a lot of our work is out of Perth, WA; these offerings might be suitable for larger organizations who need the best latency within Western Australia
* [Amazon Contact Lens](https://aws.amazon.com/blogs/contact-center/announcing-contact-lens-for-amazon-connect-preview/)
  * As Connect users, this simple feature could offer a lot of insight into calls
* [AWS DeepComposer](https://aws.amazon.com/deepcomposer/)
  * A Web MIDI keyboard that lets you play with Generative AI
* [Lambda Provisioned Concurrency](https://aws.amazon.com/blogs/aws/new-provisioned-concurrency-for-lambda-functions/)
  * Allows you to provision warm instances of Lambda to remove cold starts
* [AWS Step Functions Express Workflows](https://aws.amazon.com/blogs/aws/new-aws-step-functions-express-workflows-high-performance-low-cost/)
  * Effectively splitting Step Functions up into a cheap (but short lived) option called Express
