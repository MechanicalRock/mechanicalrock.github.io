---
layout: post
title: Domain Management for Multi-tenant Application in AWS
description: Architecting multi-tenant applications
date: 2022-07-20
author: Shermayne Lee
image: /img/blog/domain-management/multi-tenantDNS.png
tags: ['multi-tenant', 'route53', 'DNS', 'DomainManagement']
---


## Introduction

![Domain Management multi-tenant](/img/blog/domain-management/multi-tenantDNS.png)

I have recently started building an application that has to manage multiple clients' domains within the same application instance. Having few clients doesn't cause any trouble with my implementation initially. When the number of clients grows, keeping track of the tasks needed to keep the domain stable is harder. Having clear segregation for each client is also challenging when a single application serves multiple clients. 

You might think it has more business value for you to focus on maintaining and developing the application, but managing the domain is critical in keeping it live and accessible. 

Before we dive into the solution, what is a multi-tenant application?  A multi-tenant application serves multiple distinct clients, or groups, using a single deployment of an application, its infrastructure and business logic. The book [Why Multi-Tenancy is Key to Successful and Sustainable Software-as-a-Service](https://books.apple.com/us/book/why-multi-tenancy-is-key-to-successful-and/id419723802) written by Larry Aiken explains the why it is essential to have multi-tenancy for some applications as compared to a single tenant. He asserts multi-tenant application is the architecture for the best Software as a Service efficiency. 

Why can multi-tenancy be challenging? multi-tenancy is a challenging problem because you must consider your application's security, optimisation, monitoring, and high availability. As your client base grows, faults may have a higher severity.

Discussion on whether multi-tenancy is right for you is outside the scope of this post. Instead in this post, I would love to share my thoughts on how you can design your application to increase the availability, visibility and reduce some repetitive tasks for each client within the same application instance for domain management.

### Solution

In this article, I shall focus on cloud hosting, in particular I will explain how you can implement your domain management system in AWS.  

The diagram below is the solution to one way you can start.  However, as the number of clients grows you will encounter issues.

![Domain Management Architecture](/img/blog/domain-management/architectureSingleAccount.png)

It is a good practice to segregate the production environment from the development environment.  This should also apply to your domain management system. The approach above has no segregation between environments: all domain names are hosted within a single location. It increases the risk of service disruptions: reducing availability and impacting all clients. 

The architecture diagram below shows how to manage domains for all tenants in multiple environments to minimize the likelihood of impacting your production environment.  


![Domain Management Architecture ](/img/blog/domain-management/architectureDiagram.png)

There is now a clear separation between environments. The non-production environment should be identical to the production environment to enable errors to be caught in the non-production environment first without impacting the production domains. DNS is a public-facing element: you should aim to minimise downtime as it may directly affect your revenue or reputation.

AWS offers a highly scalable Domain Name System (DNS) Web service called [AWS Route 53](https://aws.amazon.com/route53/). It provides the ability to segregate the management of domain names between accounts. Account segregation, especially between non-production and production, is key to reducing the risk of damage to production domains. It also provides better insight, by segregating billing costs.

Amazon CloudFront](https://aws.amazon.com/cloudfront/), a content delivery network, speeds up the distribution of your static and dynamic web content. You can configure a single CloudFront distribution for each environment in AWS to serve requests from multiple origins or subdomains. It is essential to have [SSL certificates](https://en.wikipedia.org/wiki/Public_key_certificate) configured for each subdomains of your web application.  You can have separate CloudFront distributions, and SSL certificates, for each subdomain, but using a single distribution, and SSL certificate, can reduce the overhead for maintenance. For example, use a single SSL certificate across all subdomains.   

#### Principles

There are a few principles you should follow, which are listed below:

1. You should not provision resources under the top-level domains because your non-production and production account should be responsible for managing its subdomains and resources. 
2. Manage the registration of top-level domains from a central account. It is to ensure you have the main point to manage all domain names and subdomains should all be in its workload account to keep it consistent. 
3. All sub-domains for an application should live in the same workload account to reduce complexity. 

Lastly, a single domain management stack that manages all the resources makes change management more straightforward.

#### Wrapping Up.

Setting up multiple environments for domain management is the first step in getting your multi-tenant cloud infrastructure right. Clear segregation between development and your production environment will reduce the chances of your production domains going offline. Besides, separating top-level domains from your workload environments will increase the visibility of your resource consumption between environments.  

 There is a lot more we can optimize when it comes to multi-tenancy.  

 If you have any questions or if you want to know more about how multi-tenant works in the cloud, please don't hesitate to get in touch with us here at [Mechanical Rock](<(https://www.mechanicalrock.io/lets-get-started/)>).
