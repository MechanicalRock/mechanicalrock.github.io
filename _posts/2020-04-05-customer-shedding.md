---
layout: post
title: Customer Shedding
date: 2020-04-05
tags: cloud architecture product
author: Hamish Tedeschi
image: img/customers.png
---

# Introduction

Over the weekend, I was doing the 'social distancing' thing and was browsing Twitter. I came across a tweet from local software development badass, [LJ Kenward](https://twitter.com/LJKenward). LJ, like many people around Australia (and the world) was shopping online due to the current Corona Virus pandemic. She was surprised to learn that K-Mart (Australia) had implemented a queuing system on their eCommerce platform to presumably manage the amount of load the platform could reasonably handle at any one point. On the face of it, it sounds like a potentially valid strategy, but for some reason I couldn't stop thinking about it. And the more I thought about it, the more it began to annoy me..

![LJ's tweet, which garnered some attention](/img/lj-tweet.png "LJ's Tweet")

Customers in this day and age do not expect to wait or have a shitty user experience. There is just too much choice and the bar has been set too high by retail giants like Amazon or eCommerce platforms like Shopify. If the experience is awkward or slow, customers tend to leave. So why risk losing customers by implementing a strategy like this? Well, lets try and see if we can understand the thought process here..

# Cloud Architecture 101

Everyone in modern software development knows that 'the cloud' can easily cope with increases in demand, if you architect it correctly. Through using autoscaling techniques you can fairly easily monitor your applications and automatically adjust capacity across multiple services to maintain predictable performance. You can even set this up using dreaded clickops methods if you are so inclined!

Now, I am pretty sure that K-Mart has embarked on their own [AWS journey](https://www.itnews.com.au/news/kmart-australia-wants-to-strangle-its-mainframe-out-of-existence-535110), which makes this scenario even harder to understand. So, why would a company potentially purchase such a visible 'load shedding' queuing system (or build it) and then spend time and money to implement it. I am assuming that this queuing system also requires compute resources to run, so it would consume even more $$'s. The money spent to implement this and the potential lost revenue of those waiting online shoppers must have been less than the alternative.. Which may have been the collapse of the entire site and the loss of all online revenue? I'm not convinced, but we may never know.

# Going Deeper

Unfortunately, autoscaling doesn't solve all problems. A valid solution may be 'load shedding' but in less overt ways than a page admitting one customer at a time to your website. When a server is overloaded, it has an opportunity to triage incoming requests to decide which ones to accept and which ones to turn away. The most important request that a server will receive is a ping request from a load balancer. If the server doesn't respond to ping requests in time, the load balancer will stop sending new requests to that server for a period of time, and the server will sit idle. And in this scenario, the last thing we want to do is to reduce the size of our fleets. What you prioritise will differ from service to service, but provides an insight into what you could do.

Newer, more 'cloud native' services such as DynamoDB, offer more predictable performance and availability at scale. Even if a workload bursts quickly and exceeds the provisioned resources, DynamoDB maintains performance for that workload. AWS Lambda provides an even broader example of the focus on predictable performance. When we use Lambda to implement a service, each API call runs in its own execution environment with consistent amounts of compute resources allocated to it, and that execution environment works on only that one request at a time. This differs from a server-based paradigm, where a given server works on multiple APIs.

# Downstream Bottlenecks

The greatest liklihood is that the current eCommerce platform is a mix of legacy (potentially on premise) and newer technologies. The legacy apps may be constrained by architecture or the resources available to them.

> That legacy technology could be a bottleneck.

For example, at Mechanical Rock, we built a serverless [Progressive Web Application](https://www.mechanicalrock.io/docs/case-studies/pwa-capability-report.pdf) for a customer. It was all singing and all dancing, with offline capability and lightspeed responsiveness. However, there was a problem. When integrating with backend corporate systems, we found one in particular, which we shall call 'SOP' for the purposes of this example, could take no more than 10 requests per second. Even when the teams responsible for 'SOP' increased the resources available, this was the limit.

This meant we needed a strategy to reduce the number of errors and provide a seamless experience for users. Modern technology provides the ability to do this in abundance. We shifted the API from synchronous to a fake asynchronous design - because there was no guarantee any request could finish in a reasonable amount of time. We cached requests using DynamoDB and then throttled the number sent downstream.

# DDoS

Another possibility is that this was implemented due to a DDoS attack (although unlikely because of timing and the specific mention to COVID-19).

A distributed denial-of-service (DDoS) attack is a malicious attempt to disrupt normal traffic of a targeted server, service or network by overwhelming the target or its surrounding infrastructure with a flood of traffic. GitHub DDoS attacks are probably the most famous, when they revealed in 2018 it was hit with an attack that peaked at 1.35Tbps. More recently, the Australian Government attributed the crashing myGov site as being offline due to a DDoS attack. This however, turned out to be a [poorly architected system](https://www.zdnet.com/article/government-wheels-out-census-excuse-and-blames-mygov-crash-on-ddos/), which could not cope with the increase in demand due to job losses associated with the pandemic.

My opinion is that there are better ways than a customer queue to deal with a potential DDoS attack. In the AWS world it involves following well-architected principles around autoscaling across availability zones, using Route 53, CloudFront, Web Application Firewall (WAF) and AWS Shield in conjunction with one another.

![Common eCommerce Security Pattern](/img/ecom-sec-pattern.jpg "Common Security Pattern")

# Conclusion

It is highly likely that there is a level of complexity surrounding the decision to implement this queue, which we may never be privy to. However, there is no excuse for sacricficing new and existing customers because of it. Spend your money on addressing that, not on short term, throwaway approaches which damage your brand irreparably.

Starting out with Serverless? [Contact Mechanical Rock to Get Started!](https://www.mechanicalrock.io/lets-get-started)