---
layout: post
title: Domain Management for Multi-tenant Application in AWS
description: Architecting multi-tenant applications
date: 2022-06-22
author: Shermayne Lee
image: /img/blog/multitenancy/multitenant.png
tags: ['multitenant', 'route53', 'DNS', 'DomainManagement']
---


## Introduction

![Domain Management Multitenant](/img/blog/domain-management/multitenantDNS.png)

I have recently started building an application that has to manage multiple clients within the same application. Having few clients doesn't cause any trouble with my implementation initially. Still, when the number of clients grows, it becomes more challenging to keep up with the ongoing tasks of keeping a domain stable and able to support the application. In this post, I would love to share my thoughts on how you can reduce the challenges of managing domains for multiple clients within the same application.


Multitenant application has a single instance of an application, and its infrastructure and business logic serves multiple clients. The book [Why Multi-Tenancy is Key to Successful and Sustainable Software-as-a-Service](https://books.apple.com/us/book/why-multi-tenancy-is-key-to-successful-and/id419723802) written by Larry Aiken explains the why it is essential to have multitenancy for some applications as compared to a single tenant.


Multitenancy is a challenging problem as you have to consider your application's security, optimization, monitoring, and high availability. Each aspect of implementation could be a real challenge when it grows. For a part like domain management, you don't think it will be a problem as you will only require to do most work during the initial setup. 

However, it can be problematic along the way for a task such as SSL certificate renewal. If you have each certificate for each client's subdomain and each has a different expiration date, you need to manage them manually. Furthermore, for a task like setting up unique subdomains for new clients, what are the measures you take to ensure you will not impact your domains for other clients when there are changes to your current resources. When your number of clients grow, how do you have clear segregation of billing cost for each client? Lastly and most importantly, what is the disaster recovery plan for your instances, and how confident can you bring the application back online with minimal downtime? These are some overhead tasks we need to consider, and often most of the instances mentioned above are handled manually. 

It might have more business value for you to focus on maintaining and developing the application, but managing the domain is critical in keeping the application live and accessible.

### Solution

The diagram below is the solution to how you can typically start building it, but it will soon become challenging when it grows.

![Domain Management Architecture ](/img/blog/domain-management/architectureSingleAccount.png)

Generally, it is a good practice to segregate the production environment from the development environment, which should also apply to domain management. This approach has no segregation between environments and hosts all domain names within a single location. It increases the risk of impacting all tenants when there are service disruptions. 

The architecture diagram below shows how to manage domains for all your tenants in multiple environments.  


![Domain Management Architecture ](/img/blog/domain-management/architectureDiagram.png)

AWS Route53 domain management provides the ability to segregate the management of domain names between accounts. DNS is a public-facing element you would want to minimize downtime as it will directly impact your revenue or reputation. Having segregation between accounts, especially for non-production and production, is key to reducing the risk of damage to production domains. It is also beneficial for segregating billing costs; hence, you will get better insights. 

Besides, you can configure a single CloudFront distribution to serve requests from multiple origins or subdomains and an SSL certificate to encrypt the information. A single distribution and SSL certificate can reduce the overhead for maintenance, such as renewing all certificates for each subdomain. 

#### Principle 

There are a few principles you should follow, which are listed below:

1. You should not provision resources under the top-level domains because your non-production and production account should be responsible for managing its subdomains and resources. 
2. Manage the registration of top-level domains from a central account. It is to ensure you have the main point to manage all domain names and subdomains should all be in its workload account to keep it consistent. 
3. All sub-domains for an application should live in the same workload account to reduce complexity. 

Lastly, a single domain management stack that manages all the resources makes change management more straightforward. You can then achieve the automation by setting up a CI/CD pipeline for the stack. 


#### Wrapping Up.

 Setting up a robust pipeline for domain management is the first step in getting your multi-tenant cloud infrastructure right. 

 There is a lot more we can optimize when it comes to multi-tenancy.  

 If you have any questions or if you want to know more about how multi-tenant works in the cloud, please don't hesitate to get in touch with us here at [Mechanical Rock](<(https://www.mechanicalrock.io/lets-get-started/)>).
