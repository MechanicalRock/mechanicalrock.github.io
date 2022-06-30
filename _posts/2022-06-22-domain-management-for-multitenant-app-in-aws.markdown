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
I have recently started building an application and that has to manage multiple clients within the same application. By having few client initially doesn't cause much trouble, however when the number of clients grow, it is then becoming challenging to manage multiple application instances.   

Multitenancy is a hard problem. Each aspect of implementation could be a real challenges when it grows. For aspect like domain management, you don't think it is going to be a problem as most of it only required for initial setup. 

However it can be problematic along the way, for task like SSL certificates renewal, setting up a unique subdomains for new client, segregation of billing cost for each client and , redeployment for disaster recovery. There are some overhead tasks that we need to consider and often most of the instances mentioned above are handled manually. We can easily achieve all these by automation and hence you can focus on other added value development works. 


### Solution

This is the solution on how you can normally start building it but will soon become challenging when it grows.

![Domain Management Architecture ](/img/blog/domain-management/architectureSingleAccount.png)

As this approach has no segration between environments and all domain names are hosted within a single location. It increases the risk of impacting all tenants when there are service disruptions. Generally it is a good practice to segregate production environment from development environment and this should apply to domain management too. 

This is the architecture diagram on how you can manage domains for all your tenants in multiple environment.  


![Domain Management Architecture ](/img/blog/domain-management/architectureDiagram.png)

AWS Route53 domain management provides the ability to segregate the management of domain names between accounts. DNS is a public facing element that you would want to minimize the downtime as it will direct impact your revenue or reputation.  Having the segregation between accounts especially an account for non production and production are key to minimize the risk of damage to production domains. It is also beneficial for segregrating billing cost and hence you will get a better insights. 

Besides, you can configure a single cloudfront distribution to serve requests from multiple origins or subdomains and a  SSL certificate to encrypt the information. A single distribution and SSL certificate can reduce the overhead for maintanence such as renewing all certificates for each subdomains. 

#### Principle 

There are few principles you should follow which listed as below:

1. You should not provision any resources under the top level domains.
2. Manage the registration of top level domain from a central account.
3. Non-prod and Prod account are responsible for managing all subdomains.
4. Resources for the subdomains should provision in each workload account. 
5. All sub-domains should live in the same workload account to reduce complexity. 

Lastly, all the resources are managed under the domain management stack which makes the change management easier. You can then achieve the automation by setting up a CI/CD pipeline for the stack. 


#### Wrapping Up.

 Setting up a robust pipeline for domain management is the first step of getting your multi-tenant cloud instrastucture right. 

 There is a lot more we can optimize when it comes to multi-tenancy.  

 If you have any questions or if you want to know more on how multi-tenant works in the cloud, please don't hesitate to get in touch with us here at [Mechanical Rock](<(https://www.mechanicalrock.io/lets-get-started/)>).
