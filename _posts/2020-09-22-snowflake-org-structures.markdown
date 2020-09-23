---
layout: post
title: Which Snowflake Organization and Account Pattern is right for you?
date: 2020-09-24
tags: cloud data snowflake organizations accounts
image: img/blog/sos/banner-sos.jpg
author: Paul Symons
---
<center><img src="/img/blog/sos/banner-sos.jpg" /></center><br/>

### Snowflake in 2020

If you are working in the Information Technology space and you have not heard of Snowflake this year, there's a good chance [you have been locked in the cupboard](https://www.theregister.com/2001/04/12/missing_novell_server_discovered_after/). After recently closing their first day trading at 100% over their IPO price, they are clearly a stock to watch in the future.

Fistfuls of dollars aside, Snowflake is getting the attention of companies around the world that - to date - may not have embarked convincingly on their cloud journey. For this audience in particular, it offers a TCO that is **simple to understand**, and a technical platform that is both novel and fundamentally sustainable. That's a lifeline to many a CTO out there whose data and analytics capabilities are struggling to stay in the race, and them with it.

Snowflake are obviously not alone in this field; competitors such as Google Cloud Platform's BigQuery, AWS Redshift, but also Hadoop players such as Cloudera crowd the field, baited by yet  newer cloud native competitors such as [FireBolt](https://www.firebolt.io/) and [RockSet](https://rockset.com/). However, few match the broad appeal and favour currently experienced by Snowflake that appears to strike a compelling equilibrium between [engineering talent and data services cost](https://www.holistics.io/blog/the-two-philosophies-of-cost-in-data-engineering/). 

Today we talk about upcoming Snowflake Organization support, what it is, and what it might mean for the way you use Snowflake. 


### Emergence of Snowflake Organization Support

Most people likely experience Snowflake through a single or paired accounts (prod and dev). For many companies and organisations, this will do just fine (some don't even create separate dev accounts). Until recently, creating additional Snowflake accounts has been a task managed by Snowflake Support teams; typically to create in another cloud, or separate region.

Recently, Snowflake has been privately previewing an Organizations capability; with references to the feature [now appearing on pages about cross cloud sharing](https://docs.snowflake.com/en/user-guide/secure-data-sharing-across-regions-plaforms.html) and [replication](https://docs.snowflake.com/en/user-guide/database-replication-config.html), one would have to expect this feature will land in **public preview** very shortly.

Scholarly [comments about multi-cloud](https://cloudpundit.com/2020/09/18/the-multicloud-gelatinous-cube/) are numerous, and whilst I definitely don't want to enter [that debate](https://www.lastweekinaws.com/blog/multi-cloud-is-the-worst-practice/) today, Snowflake's hegemonious approach to cloud data warehousing allows them not only to **comfortably operate** on the *top tier* public clouds, but also facilitates  interoperation between them, by allowing you to **replicate across different cloud platforms and regions**.


### What does Snowflake Organization Support offer you?

#### Account Vending

Essentially, Snowflake Organizations allows you to be in control of your Snowflake **account vending**. It means you as a customer can create new accounts

* in different geographical locations
* on different public cloud platforms

In addition, only accounts belonging to a Snowflake Organization can replicate databases from one account to another. If you are doing this already without access to Snowflake Organizations, it's likely because Snowflake is managing the account membership of your organization for you.

I won't cover the specifics of the account vending, because as a private preview feature it is still possible the details will change (refer to the referenced documentation for details), though you should note at this time that account removal appears to require a support request.

#### Multi Organizational Capability

Maintaining multiple Snowflake Organizations can be used to enable:

* Separate / Split Billing across an organisation
* Independent ownership / accountability with shared management 

Yet it also comes with complications that we will elaborate on later.

#### Single Organization Features

Remaining in a single Snowflake Organization carries a number of key benefits

* Use of the [Snowflake Private Data Exchange](https://docs.snowflake.com/en/user-guide/data-exchange.html) across your Snowflake Organization accounts as a way to catalog, publish and discover datasets within your participating accounts.
* Replication of databases across cloud regions
* Consolidated Billing with per account breakdown



### Snowflake Organizations in comparison to AWS Organizations

||AWS Organizations|Snowflake Organizations|
|-|-|-|
|*Who pays?*|Master Account|Snowflake Organization Owner|
|*Organizational Units*|Yes|No|
|*Member Account Cost Breakdown*|Yes|Yes|
|*Separate Billing*|No|No|
|*Account can leave organization*|Yes|Unclear|
|*Accounts can operate in all regions*|Yes|No - Single cloud region only|


### Hypothetical Use Cases


#### Multi National Corporations with Subsidiaries

Many large multi-nationals are dispersed not only geographically, but in function or capability. Others operate globally, but with regional locality (or subsidiaries).  

In a recent AWS Big Data Blog, [Toyota describe how they rolled out a serverless data lake and analytics capability](https://aws.amazon.com/blogs/big-data/enhancing-customer-safety-by-leveraging-the-scalable-secure-and-cost-optimized-toyota-connected-data-lake/), to service their burgeoning in-car telemetry data.

Reasons such as sovereignty, cost or latency may dictate that the journeys your data make within your organisation vary, depending on the region in which they originate. Independent Snowflake Organizations can be a good way to support autonomous subsidiaries or joint ventures that have a likelihood of future secession.


#### Loosely Coupled Organisations with broad purpose

A different scenario is where you have a number of organisations that are similar in function, united by purpose, yet operated and governed independently of each other (and possibly even subject to separate jurisdictions or legislation. 

In Australia, an example of this could be the [31 Primary Health Networks](https://www1.health.gov.au/internet/main/publishing.nsf/Content/PHN-Profiles) (PHNs) that locally co-ordinate the appropriate network of health providers for all Australians. Each PHN is responsible for acquisition of patient data from relevants providers, and as such collectively manage a vast potential data portfolio that is of powerful consequence to government agencies that focus on national health outcomes and policy, such as the [Australian Institute of Health and Welfare](https://www.aihw.gov.au/). 

As Australia is a federation of States and Territories, it follows that each jurisdiction can and generally does have [some of its own laws relating to privacy](https://www.oaic.gov.au/privacy/privacy-in-your-state/), especially in relation to public agencies. In these scenarios, it may be prudent for each jurisdiction to have their own Snowflake Organization that can be administered independently of those in other states, whilst retaining the capability to share data within the same region.

### Patterns

It's important to note that one of Snowflake's key features - **simple cross account sharing of data** - is independent of the Snowflake Organization feature. Accounts **do not** have to belong to the same Snowflake Organization to share data. 

However, sharing can only happen within the same cloud region. This is important to understand, as it effectively means you must replicate your data (**and hence pay storage again**) in order to share across the cloud / region boundaries.

I've omitted the simplest use case of a single Snowflake organization with a single account, as this is the default for most people when they onboard with Snowflake.

#### Multiple Snowflake Organizations

In this pattern we imagine a global car manufacturing corporation, ***Foryota***, that has subsidiaries around the world. Each essentially runs autonomously yet the corporate parent still wants to be able to share data for global efficiencies of scale.

In the following diagram, you will note that in order to share with accounts in a destination region (e.g. Tokyo), a remote organization must first replicate its data to an account in its own Snowflake Organization - **in the same destination region** - before it can be shared with an account from another Snowflake Organization.

While there may be genuine reasons for requiring individual Snowflake Organizations, it will add complexity and likely some additional cost as well.

![Multiple Organizations](/img/blog/sos/multi-cloud-multi-org.jpg)
<center><em>Independent operation of organizations, separate remittance; disparate views of global Snowflake operation</em></center>

#### Single Organization, Multiple Regions / Clouds, Multiple Accounts

Next is an alternative structure that keeps everything managed through a single Snowflake Organization. This allows accounts to replicate some of their databases to other accounts in the organization that operate in different cloud regions, effectively opening up opportunities for cross cloud / region sharing.

This scenario is likely to be a common choice for many geographically or multi cloud businesses. It can also be an effective cross cloud / region redundancy architecture, where [databases can be failed over to alternate regions to which they are being replicated](https://docs.snowflake.com/en/user-guide/database-failover-intro.html).

![Single Organization, Multi Region](/img/blog/sos/multi-cloud-single-org.jpg)
<center><em>In the single organization view, all costs are payable by the organization owner; yet the owner will also receive a breakdown of costs for each account within the organization</em></center>


#### Single Organization, Single Region / Cloud, Multiple Accounts
This is going to be perhaps the most common pattern for many large organisations that work within a single cloud region. By working in a single cloud region, cross account sharing is supported. Master and reference data sets can be shared by a corporate account for access by all other divisional accounts within the same region.

![Single Organization, Single Cloud/Region](/img/blog/sos/single-cloudregion-single-org.jpg)
<center><em>Same region organization structure minimizes data movement and cost</em></center>

### Think about the money

How should you make sense of all this when it comes to cost? The following page lists the [associated costs of Snowflake usage](https://www.snowflake.com/pricing/pricing-guide/) across clouds and regions, and it has some important dimensions to consider, notably:

* On-demand credit cost varies significantly by region
* Expect to pay between $100-$200 per TB transferred out of regions, *except* within AWS regions in North America where it can be as low as $20 per TB
* Storage costs are fairly consistent globally, both across regions and clouds

### Summary

This was a brief introduction to Snowflake Organizations, and how it relates to support for secure sharing between accounts and recently released features such as database replication across cloud regions.

With Snowflake, cost modelling and management is critical to maximising your value from the service. Customers should weigh carefully the different options and implications, to match their aspirations and capabilities appropriately.

No matter the size of your company or organisation, Mechanical Rock are eager to listen to your challenges and meet them head on. [Get in touch with Mechanical Rock](https://mechanicalrock.io/lets-get-started) today to accelerate your journey!




### References

* [https://pixabay.com/photos/organization-organization-chart-2478211/](https://pixabay.com/photos/organization-organization-chart-2478211/) (banner credit)
* [https://docs.snowflake.com/en/user-guide/secure-data-sharing-across-regions-plaforms.html](https://docs.snowflake.com/en/LIMITEDACCESS/organizations.html)
* [https://docs.snowflake.com/en/user-guide/database-replication-config.html](https://docs.snowflake.com/en/user-guide/database-replication-config.html)
* [https://docs.snowflake.com/en/user-guide/database-failover-intro.html](https://docs.snowflake.com/en/user-guide/database-failover-intro.html)
* [https://docs.snowflake.com/en/user-guide/data-exchange.html](https://docs.snowflake.com/en/user-guide/data-exchange.html)
* [https://docs.snowflake.com/en/LIMITEDACCESS/organizations.html](https://docs.snowflake.com/en/LIMITEDACCESS/organizations.html)
* [https://www.snowflake.com/pricing/pricing-guide/](https://www.snowflake.com/pricing/pricing-guide/)
* [https://www.snowflake.com/wp-content/uploads/2017/07/CreditConsumptionTable.pdf](https://www.snowflake.com/wp-content/uploads/2017/07/CreditConsumptionTable.pdf) (with legacy pricing tiers)
* [https://aws.amazon.com/blogs/big-data/enhancing-customer-safety-by-leveraging-the-scalable-secure-and-cost-optimized-toyota-connected-data-lake/](https://aws.amazon.com/blogs/big-data/enhancing-customer-safety-by-leveraging-the-scalable-secure-and-cost-optimized-toyota-connected-data-lake/)
* [https://cloudpundit.com/2020/09/18/the-multicloud-gelatinous-cube/](https://cloudpundit.com/2020/09/18/the-multicloud-gelatinous-cube/)
* [https://www.lastweekinaws.com/blog/multi-cloud-is-the-worst-practice/](https://www.lastweekinaws.com/blog/multi-cloud-is-the-worst-practice/)
* [https://www.holistics.io/blog/the-two-philosophies-of-cost-in-data-engineering/](https://www.holistics.io/blog/the-two-philosophies-of-cost-in-data-engineering/)
* [https://mechanicalrock.io/lets-get-started](https://mechanicalrock.io/lets-get-started)