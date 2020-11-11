---
layout: post
title: The Cloud Data Warehouse - How Do You Like Yours?
date: 2020-11-09
tags: cloud data warehouse snowflake bigquery redshift
image: img/blog/sos/snowcdw/banner.jpg
author: Paul Symons
---
<center><img title="Dashboards - https://unsplash.com/photos/JKUTrJ4vK00" src="/img/blog/snowcdw/banner.jpg" /></center><br/>

## The Modern Analytics Engineering Stack

I recently took a little time to read through [The Analytics Guide Book](https://www.holistics.io/books/setup-analytics/start-here-introduction/) by  [Holistics](https://www.holistics.io/product/). It resonates a lot with the way we think about working with data at [Mechanical Rock](https://mechanicalrock.io/), especially on the following principles:

* ELT over ETL
* SQL based analytics is the way forward
* Use Technology To Replace Labor Whenever Possible (*So your people can focus on business value instead*)

It's rare to see a book presented in such an accessible way that manages to balance complexity and insight - I recommend it to anyone looking to re-evaluate how they maximise return on investment from their data.

This blog post is in two parts; in the first part, we will elaborate on modern Cloud Data Warehouses; in the second part we will focus on how their features allow a more flexible and agile way of delivering analytics engineering, as described in the Analytics Guide Book.

## The Cloud Data Warehouse

A Data Warehouse is an **enabling technology** for your business to **make decisions** in relation to **the data you gather**. By arranging, conforming, and curating your data to radiate the key performance indicators of your business, a Data Warehouse forms one half of *the presentation layer* - alongside visualisation tools - that enable users in your organisation to identify insights. At least, this is the **traditional view**.

Modern Cloud Data Warehouses can support the existing status quo, including various data modelling methodologies such as Kimball, Inmon or Data Vault for example. Putting the word ***cloud*** in front of *data warehouse* does what you would expect cloud to do, it addresses many of the technological limitations associated with traditional Data Warehouses - namely storage availability, compute scalability, and high availability.

However, modern Cloud Data Warehouses typically go far beyond that. Whilst delivering the core competencies of a Data Warehouse, they extend these capabilities with features not readily seen before. For example:

* [BigQuery ML](https://cloud.google.com/bigquery-ml/docs/introduction) allows users to inference with Machine Learning models against their datasets directly, using SQL. A more generic feature is also available on Snowflake using [External Functions](https://docs.snowflake.com/en/sql-reference/external-functions-introduction.html) 
* Snowflake's [Zero Copy Data Sharing](https://docs.snowflake.com/en/user-guide-data-share.html) across accounts in the same cloud region, and [Replication Across Cloud Platforms](https://docs.snowflake.com/en/user-guide/database-replication-failover.html) as described in our recent blog post on [Snowflake Organizations](https://mechanicalrock.github.io/2020/09/23/snowflake-org-structures.html), are a powerful enabler for complex organisations, especially those navigating multi cloud strategies
* Data Time Travel features of both [Snowflake](https://docs.snowflake.com/en/user-guide/data-time-travel.html) and [BigQuery](https://cloud.google.com/bigquery/docs/time-travel), allowing you to see data as it was at a particular point in time

As many organisations evolve to consist of more multi-disciplinary teams, so too has technology adapted to more simply support the kind of collaboration and critical insight work that most organisations require. And so, a *modernised view* of the Data Warehouse is upon us where the technology is no longer simply a keystone of the architecture, but rather a platform for enhancement and enablement of data.

### OLTP, The Data Lake and OLAP

First, let's start by defining some of these common terms and acronyms.

 **Online Transactional Processing** refers to systems of record that we might expect to experience a high degree of write activity as well as read activity. Historically this has indicated data mutability, though recent software architectures such as Event Sourcing demand immutable systems of record. Whilst it is common for OLTP systems to be comprised of relational databases, it is also common for document or NoSQL databases to take this role also.

 **Online Analytical Processing** refers to technologies and methodologies designed to respond to complex analytical queries with the best performance possible. It is highly focused on read performance and often incorporates different database technologies, specific data modelling and normalization techniques, and an absence of enforced constraints and table indices. OLAP systems tend to be vastly outnumbered by OLTP systems (in fact many organisations may have only one OLAP system), yet the variety and volume of data contained is usually much greater in an OLAP system.

 **Data Lakes** are the organisation of data at rest for a variety of purposes. It can comprise of structured and unstructured data, and its utility typically goes beyond general analytics and reporting requirements. For example it could include streaming video data, raw text, audio recordings as well as traditional structured data exported or streamed from OLTP systems.

 Organisations have been building data lakes for years and whilst many began on premise, most are built in the cloud these days due to:
 * decreasing cost of cloud storage
 * availability of high quality managed cloud services to compute on bulk data
 * increased resilience and storage features (e.g. lifecycling) of cloud storage

 The key point to understand is that **for the specific use case of general analytics and reporting**, cloud data warehouses are **combining the best of OLAP and Data Lakes** into one cohesive service offering: where storage is cheap but resilient; compute is scalable and priced on usage; and operational overhead is low.




### Resilient Architecture

The fact that Cloud Data Warehouses are designed for resiliency and high availability is an understated advantage. To be clear, we are talking about service reliability, over data reliability (more on that in the next post). Many large organisations who have presence in multiple data centres for availability concerns are beginning to transition their secondary data centres to be cloud based. Whilst there can be significant operational and capital expenditure savings from this, it often leaves organisations with old world problems:

* working at the virtualization layer
* low utilisation of warm standbys
* typically manual disaster recovery processes

When you consider [availablity and recovery modes for BigQuery](https://cloud.google.com/bigquery/docs/availability) and [Snowflake's architecture](https://resources.snowflake.com/snowflake/how-to-make-data-protection-and-high-availability-for-analytics-fast-and-easy), it is clear that the discussion around disaster recovery changes, somewhat, for a number of reasons
* the kind of disaster scenario you need to recover from may be different
* the time and costs to rehearse disaster recovery are likely reduced
* the skills required to recover from disaster may be different

Does this mean disaster recovery goes away with a Cloud Data Warehouse? Not necessarily - but there's a good chance it will be different and easier to automate.

### The Performance Equation

A major advantage of Cloud Data Warehouses is their ability to compute queries that would typically fail on fixed size, in-memory query engines like Presto. That is not a criticism of Presto, but rather that at any one point in time, Presto is working with a fixed number of compute nodes. If you are using Presto on an AWS EMR cluster for example, you can [scale the cluster](https://docs.aws.amazon.com/emr/latest/ManagementGuide/emr-automatic-scaling.html) in and out in response to scheduler memory availability - but there's no guarantee scaling will be effective before current queries run out of memory.

Each implementation of a Cloud Data Warehouse is different, but using Snowflake as an example, they manage these kinds of challenges by [**spilling**](https://community.snowflake.com/s/article/Recognizing-Disk-Spilling) (a bit like swap file paging). When memory is exhausted, interim results are streamed to local disk, then if that becomes exhausted, it writes to remote storage (e.g. S3 / GCS) instead. With few exceptions, this will make your query a lot slower to execute, but at least you will get your results, and it can help you make decisions about whether to move your query to more powerful compute, as well as optimizing your query.

> The **key question** to ask yourself is this: if you are concerned primarily with your **time to value**, where would you rather spend your effort - managing complex big data infrastructure? Or,  **generating value for your organisation from data**?


Cloud Data Warehouses are designed to manage high volume *concurrent workloads*. Most organisations do not have steady workloads that balance their compute requirements over the day or week - it is typical for workloads to be *spiky*, instead. If you have a workload that is subject to regular spikes, or encounters *mega-events* (such as sale days, race events or EOFY reporting), how do you ensure quality of service that users expect?

Cloud Data Warehouses make this simpler to manage and quantify. While most managed services are still subject to quotas and limits, they are typically more **flexible** and **cost effective** for results delivered than lower level services or self hosted options.

As an example, [Google BigQuery's slot system](https://cloud.google.com/bigquery/docs/slots) combines fixed units of compute (slot) with a variety of pricing models, such as:
* On-demand pricing (pay for what you use, but you are limited to 2000 slots for each GCP project)
* Fixed-rate pricing (pay to reserve a fixed amount of slots)
* Flex pricing (pay to reserve a fixed amount of slots for a very specific time period (e.g. down to 60 seconds)

The best part is that you can combine these pricing mechanisms to suit both your baseload and your mega-event loads.

Snowflake takes a different approach with its [Virtual Warehouse](https://docs.snowflake.com/en/user-guide/warehouses-overview.html) concept, where you can 
* scale vertically (increase the warehouse size to handle larger / more complex workloads)
* scale horizontally (scale warehouse clusters in numbers to increase capacity for concurrency)
* do both at the same time.

Both platforms give you flexibility not only to choose the compute and pricing model that suits your workloads, but also to observe the current and historical workload profiles, helping you to match more closely the pricing model to the utilisation metrics. 

## Which Cloud Data Warehouse should we choose?

In general I think it is more productive to match a Cloud Data Warehouse to your intended usage and workloads, than it is to compare Cloud Data Warehouse offerings against each other. Typical early considerations include
* What cloud platforms (if any) you currently work with
* Where your data is coming from
* Volume of historic data and growth rate of data
* Which geographic regions you operate in
* How many users / workloads you will typically support

However, here are some hot takes I'd make for general analytical workloads based in Australia

I would favour or at least consider **BigQuery** when any of the following apply
* Most of the data came from existing workloads in the same Google Cloud Region
* Data Warehouse workload was focused on data science or machine learning
* There is a business requirement to stream data to the warehouse in near realtime

I would consider **Amazon Redshift** when any of the following apply
* I have a fairly constant and stable utilisation profile that is well suited to pre-purchasing reserved instances for cost optimization
* I want to to provide a unified data warehouse access layer comprised of federated AWS sources (e.g. operational RDS databases, S3) in order to build out native Redshift data marts

**For most other use cases, I would favour Snowflake**.

You may notice that we haven't discussed Amazon Redshift too much in our consideration of Cloud Data Warehouse solutions; we have and continue to work with customers using Redshift and are happy to continue doing so. Yet there are reasons why we often reach for other solutions:

* Redshift has struggled to keep pace with the feature sets of competitors such as BigQuery and Snowflake
* It is generally more engineering intensive, considering administration, utilisation and optimisation - managing infrastructure is still a customer concern
* Storage and Compute separation is primitive - whilst this is improving with recent RA3 nodes, the price premium to be paid is a disincentive, for something that still doesn't match what competitors are offering (true on-demand usage)
* Lack of high availability - Redshift clusters are limited to operating in a single availability zone. Whilst a cluster can generally recover simply from individual data node failures, a power loss to a whole AZ would require customers to create a new cluster from snapshots in a different AZ

At the end of the day, you need to choose a solution your organisation is capable of supporting. Just make sure you compare apples with apples however and consider both the [labour cost and the service costs](https://www.holistics.io/blog/the-two-philosophies-of-cost-in-data-engineering/) involved in your warehouse. 

## Successfully transitioning to a Cloud Data Warehouse

When planning a migration to a Cloud Data Warehouse, you need to consider:

* How to transition skilled database administrators and operations staff to cloud?
* What extra skills are required with a Cloud Data Warehouse?
* Is a Cloud Data Warehouse going to lower our TCO for Data Warehousing?

These are complicated questions to answer but it's worth bearing in mind that the effort required to maintain business services doesn't go away, it just changes in nature. As we'll explore in the next article, the core skills of ETL developers are absolutely transferable.

New themes emerge with Cloud Data Warehouses. The technology or implementations may change, but the risks and controls should be very familiar to experienced data warehouse operations professionals.

### Pay To Play

Traditional IT project funding, delineated by long-term capital versus short-term operational expenditure, tends to pit spenders against controllers with little regard for each other's position. In many ways, cloud computing has confused this mud wrestling melee, by removing the asset curtain of hardware and licensing that is traditionally used to hide costs.

![IT Tug of War - two dogs wrestling - https://unsplash.com/photos/IFK5ROpTimo](/img/blog/snowcdw/tugofwar.jpg)

Though cloud platforms simplify TCO by offering managed services and abstracting hardware and licensing costs, the challenge of estimating and assessing cost for business cases remains. The war stories and lessons learned of cloud pioneers, have been distilled into behaviours and practices commonly labelled as **FinOps**.

Like many things with ***Ops*** tacked on the end, [FinOps](https://www.finops.org/what-is-finops/) takes inspiration from [The Third Way of DevOps](https://itrevolution.com/the-three-ways-principles-underpinning-devops/). It boils down to:
* **Inform** by giving visibility and forecasting of cloud spend, utilisation and efficiency
* **Optimize** by helping teams appraise their workloads, and provide cost efficient patterns and blueprints. [Mechanical Rock](https://mechanicalrock.io) are qualified to undertake [Well Architected Reviews](https://www.mechanicalrock.io/our-story/our-partners/aws/), designed to deliver this insight
* **Operate** at the organisational level to leverage discounts, assess capacity requirements, arrange and deliver training and certification packages to match people capability to organisational demand

If we translate that to a Snowflake Cloud Data Warehouses, some examples may include

|Inform|Optimize|Operate|
|-|-|-|
|warehouse utilization reports|warehouse sizing|capacity discount purchase|
|query performance analysis|data materialization|certifications and training|
|granular cost analysis|automated resource vending|data integration and transformation patterns|


These challenges have to be addressed to ensure value for money from your investment.

### SecOps

[SecOps](https://www.sumologic.com/glossary/secops/) applies to all cloud estates including the domain of Cloud Data Warehouses, where the attack vectors for data leakage, pollution and security compromise differ from traditional perimeter secured, on premise data warehouses. Examples of challenges organisations face in this realm are
* How to appropriately integrate a Cloud Data Warehouse with cloud native access models or external identity providers
* How to limit network access to specific locations or users or both
* How to design security hierarchies to prevent leakage of data from new ingress and egress patterns
* How to report user behaviour and security activity to existing SIEM systems

These challenges are not new, but many organisations legitimately fear taking these concerns into public cloud environments. It's safe to say that Cloud Data Warehouses have answers to the questions above, yet the burden remains on the customer to configure and report on these concerns.

As a [DevOps Consultancy](https://mechanicalrock.io/our-expertise/enterprise-devops), this is our bread and butter and so if you find any of the following are missing from your solutions, you should be asking why:
* Principles of Least Privilege and Declaritive Security Controls in relation to all roles accessing and managing your data
* Automated pipelines for management of Data Warehouse Security, structure and data transit
* Automated Compliance assessment and notification in relation to your risk controls for infrastructure and security

## Wrapping Up

It's easy to get wrapped up in the promise of sales literature, effervescent customers or case studies, industry hype, and forget that the Data Warehouse is a single part of a longer value chain. A great Cloud Data Warehouse implemented poorly - or strangled by the data acquisition pathways ahead of it - will not turn any ships around. 

So do your homework - assess your whole data lifecycle, and take the opportunity to make other strategic investments to modernize your data stack, knowing that with a Cloud Data Warehouse you will no longer be on the hook for:

* Software Licensing
* Managing Infrastructure 
* Hardware Refreshes
* Vendor "Cloud Tax"

The biggest cost you face is that of the missed opportunity. 

If you are ready to accelerate your growth, get in touch with us at [Mechanical Rock](https://mechanicalrock.io/our-expertise/)
