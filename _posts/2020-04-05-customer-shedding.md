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

Now, I am pretty sure that K-Mart has embarked on their own [AWS journey](https://www.itnews.com.au/news/kmart-australia-wants-to-strangle-its-mainframe-out-of-existence-535110), which makes this scenario even harder to understand. So, why would a company potentially purchase a queuing system (or build it) and then spend time and money to implement it. I am assuming that this queuing system also requires compute resources to run, so it would consume even more $$'s. The money spent to implement this and the potential lost revenue of those waiting online shoppers must have been less than the alternative.. Which may have been the collapse of the entire site and the loss of all online revenue? I'm not convinced, but we may never know.

# Downstream Bottlenecks

The greatest liklihood is that the current eCommerce platform is a mix of legacy and newer technologies. 

That legacy technology could be a bottleneck.

For example, we at Mechanical Rock built a serverless [Progressive Web Application](https://www.mechanicalrock.io/docs/case-studies/pwa-capability-report.pdf) for a customer. It was all singing and all dancing, with offline capability and lightspeed responsiveness. However, there was a problem. When integrating with backend corporate systems, we found one in particular, which we shall call 'SOP' for the purposes of this example, could take no more than 10 requests per second. Even when the teams responsible for 'SOP' increased the resources available, this was the limit. 

This meant we needed another strategy to reduce the number of errors. Modern technology provides this in abundance. We built a .... words

Picture?


# DDoS

A distributed denial-of-service (DDoS) attack is a malicious attempt to disrupt normal traffic of a targeted server, service or network by overwhelming the target or its surrounding infrastructure with a flood of traffic. GitHub DDoS attacks are probably the most famous, when they revealed in 2018 it was hit with an attack that peaked at 1.35Tbps.

My personal opinion is that there are better ways than a customer queue to deal with a DDoS attack. In the AWS world it involves following well-architected principles around autoscaling across availability zones, using Route 53, CloudFront, Web Application Firewall (WAF) and AWS Shield in conjunction.

![Common eCommerce Security Pattern](/img/ecom-sec-pattern.jpg "Common Security Pattern")

# Conclusion

In Summary, there is no excuse for pissing off your customer today. Spend your money on addressing that, not on short term, throwaway approaches which damage your brand irreparably.

Starting out with Serverless? [Contact Mechanical Rock to Get Started!](https://www.mechanicalrock.io/lets-get-started)