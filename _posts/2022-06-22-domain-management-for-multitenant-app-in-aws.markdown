---
layout: post
title: Domain Management for Multi-tenant Application in AWS
description: Architecting multi-tenant applications
date: 2022-07-12
author: Shermayne Lee
image: /img/blog/multitenancy/multitenant.png
tags: ['multitenant', 'route53', 'DNS', 'DomainManagement']
---


## Introduction

![Domain Management Multitenant](/img/blog/domain-management/multitenantDNS.png)

I have recently started building an application that has to manage multiple clients' domains within the same application instance. Having few clients doesn't cause any trouble with my implementation initially. When the number of clients grows, keeping track of the tasks needed to keep the domain stable is harder. Having clear segregation for each client is also challenging when a single application serves multiple clients. 

You might think it has more business value for you to focus on maintaining and developing the application, but managing the domain is critical in keeping it live and accessible. 

Before we dive into the solution, what is a multitenant application? Multitenant application has a single instance of an application, and its infrastructure and business logic serves multiple clients. The book [Why Multi-Tenancy is Key to Successful and Sustainable Software-as-a-Service](https://books.apple.com/us/book/why-multi-tenancy-is-key-to-successful-and/id419723802) written by Larry Aiken explains the why it is essential to have multitenancy for some applications as compared to a single tenant.

What makes multitenancy challenging, and so as domain management for multitenant? Multitenancy is a challenging problem because you must consider your application's security, optimization, monitoring, and high availability. Each aspect of implementation could be a real challenge when it grows.

In this post, I would love to share my thoughts on how you can design your application to increase the availability, visibility and reduce some repetitive tasks for each client within the same application instance for domain management.

### Solution

It depends whether you are hosting your application on cloud or on premise. Cloud hosting has greater flexibility and scalability than on-premise hosting. Hence in this article, I will explain how you can implement your domain management system in AWS. 

The diagram below is the solution to how you can typically start building it, but it will soon become challenging when the number of clients grows.

![Domain Management Architecture ](/img/blog/domain-management/architectureSingleAccount.png)

Generally, it is a good practice to segregate the production environment from the development environment, which should also apply to your domain management system. This approach has no segregation between environments and hosts all domain names within a single location. It increases the risk of impacting all tenants when there are service disruptions. Hence it has a greater chance of affecting the availability of the application. 

The architecture diagram below shows how to manage domains for all tenants in multiple environments to minimize the likelihood of impacting your production environment.  


![Domain Management Architecture ](/img/blog/domain-management/architectureDiagram.png)

The critical difference between these two diagrams is the latter has a clear separation between environments. The infrastructure for the non-production environment should be identical to the production environment to enable errors to be caught in the non-production environment first without impacting the production domains. DNS is a public-facing element you would want to minimize downtime as it will directly affect your revenue or reputation.

AWS offers a highly scalable Domain Name System (DNS) Web service called AWS Route53. It provides the ability to segregate the management of domain names between accounts. Having segregation between accounts, especially for non-production and production, is key to reducing the risk of damage to production domains. It is also beneficial for segregating billing costs; hence, you will get better insights. 

Amazon CloudFront is a web service that speeds up the distribution of your static and dynamic web content. You can configure a single CloudFront distribution for each environment in AWS to serve requests from multiple origins or subdomains. It is essential to have SSL certificates configured for the subdomains to secure your web application. An SSL certificate is a digital certificate that authenticates a website's identity and enables an encrypted connection. You can have individual CloudFront distribution and SSL certificates for each subdomain, but having a single distribution and SSL certificate can reduce the overhead for maintenance, such as renewing only one SSL certificate for all subdomains.  


#### Principle 

There are a few principles you should follow, which are listed below:

1. You should not provision resources under the top-level domains because your non-production and production account should be responsible for managing its subdomains and resources. 
2. Manage the registration of top-level domains from a central account. It is to ensure you have the main point to manage all domain names and subdomains should all be in its workload account to keep it consistent. 
3. All sub-domains for an application should live in the same workload account to reduce complexity. 

Lastly, a single domain management stack that manages all the resources makes change management more straightforward.

#### Wrapping Up.

Setting up multiple environments for domain management is the first step in getting your multi-tenant cloud infrastructure right. Clear segregation between development and your production environment will reduce the chances of your production domains going offline. Besides, separating top-level domains from your workload environments will increase the visibility of your resource consumption between environments.  

 There is a lot more we can optimize when it comes to multitenancy.  

 If you have any questions or if you want to know more about how multi-tenant works in the cloud, please don't hesitate to get in touch with us here at [Mechanical Rock](<(https://www.mechanicalrock.io/lets-get-started/)>).
