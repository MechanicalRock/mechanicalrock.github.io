---
layout: post
title:  "re:Invent 2019 Recap"
date: 2019-12-06
tags: aws reinvent recap
author: Nathan Glover
image: img/inception-pipelines/s2o-how-it-was/banner-heading.jpg
---

## Introduction

re:Invent 2019 is the largest Amazon run event that occurs yearly in Las Vegas. Since 2011 it has been progressively scaling up in size and this year I was lucky enough to be able to attend for the first time.

I'm sure many readers have equantent themselves with the announcements remotely; however as someone who; in 2018 tried to digest what releases were "important"; I've decied to put together this post outlining the things that stood out to me.

### Fargate

When fargate launched at re:Invent 2017 there was a lot of excitement from anyone who had been running container workloads. Fargate allowed developers to freely scale their workloads UP and OUT with very minimal configuration and only pay for the time those containers were actually running.

A few years later and developers have been looking at Fargate for more features, and we were lucky enough this year to see a few of these launch!

#### Fargate for EKS

Kubernetes has grown in popularity a lot over the last couple years, however there's a lot of overhead required to manage a Kuberenetes cluster; and this overhead has become just another thing developers need to learn in order to deploy their applications.

Fargate for EKS is potentially a solution to this hurdle, allowing developers to deploy containers to EKS through Fargate.

[EKS](https://aws.amazon.com/blogs/aws/amazon-eks-on-aws-fargate-now-generally-available/)

#### Fargate Spot Instances

[Spot instances](https://aws.amazon.com/blogs/aws/aws-fargate-spot-now-generally-available/)

If you aren't familiar with Spot pricing then your wallet might become a lot happier after reading this. Spot instances in the context of EC2 is compute that can be taken away from you at any point in time, meaning that applications running on spot need to be interruption tolerant. The benefit however is you'll recieve a discount of up to 70% by running spot.

Fargate Spot instances offer the same opportunity, however with your container workloads instead. You can setup a spot cluster by simply selecting spot under Instance Configuration.

    {:refdef: style="text-align: center;"}
        <img src="/img/blog/reinvent-2019-recap/fargate-spot-instance.png" width="200">
    {: refdef}

### SageMaker

#### SageMaker Studio

#### SageMaker AutoPilot

Auto ML has been available on competing clouds for a while now

### CodeGuru

[CodeGuru](https://aws.amazon.com/about-aws/whats-new/2019/12/aws-announces-amazon-codeguru-for-automated-code-reviews-and-application-performance-recommendations/)

### Amazon Kendra

Kendra
