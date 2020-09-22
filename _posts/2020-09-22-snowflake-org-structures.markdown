---
layout: post
title: Which Snowflake Organization and Account Pattern is right for you?
date: 2020-09-22
tags: cloud data snowflake organizations accounts
image: img/blog/sos/banner-sos.jpg
author: Paul Symons
---
<center><img src="/img/blog/sos/banner-sos.jpg" /></center><br/>

## Snowflake Re-cap

Snowflake is a cloud data warehouse etc. etc.

Competitors GCP BigQuery, AWS Redshift, but also Hadoops and nuevo cloud native competitors such as FireBolt, RockSet, etc. https://rockset.com/

Today we talk about upcoming Snowflake Organization support, what it is, and what it might mean for the way you use Snowflake. 

## Emergence of Snowflake Organization Support

Most people likely experience Snowflake through a single or paired accounts (prod and dev). For many companies and organisations, this will do just fine (some don't even create separate dev accounts). Until recently, creating additional Snowflake accounts has been a task managed by Snowflake Support teams; typically to create in another cloud, or separate region.

Recently, Snowflake has been privately previewing an Organizations capability; with references to the feature [now appearing on pages about cross cloud sharing](https://docs.snowflake.com/en/user-guide/secure-data-sharing-across-regions-plaforms.html) and [replication](https://docs.snowflake.com/en/user-guide/database-replication-config.html), one would have to expect this feature will land in **public preview** very shortly.

Comments about [multi-cloud](https://www.lastweekinaws.com/blog/multi-cloud-is-the-worst-practice/) are numerous, and whilst I definitely don't want to enter that debate today, Snowflake's hegemonious approach to cloud data warehousing allows not only to **comfortably operate** on the *top tier* public clouds, but also facilitates  interoperation between them by allowing you to **replicate across different cloud platforms and regions**.


## What is Snowflake Organization Support

### Account Vending

Essentially, Snowflake Organizations allows you to be in control of your Snowflake **account vending**. It means you as a customer can create new accounts

* in different geographical locations
* on different public cloud platforms

In addition, only accounts belonging to a Snowflake Organization can replicate databases from one account to another. If you are doing this already without access to Snowflake Organizations, it's likely because Snowflake is managing the account membership of your organization for you.

I won't cover the specifics of the account vending, because as a private preview feature it is still possible the details will change (refer to the referenced documentation for details), though you should note at this time that account removal appears to require a support request.

### Multi Organizational Capability

Maintaing multiple Snowflake Organizations can be used to enable:

* Separate / Split Billing across an organisation
* Independent ownership / accountability with shared management (if there can be one organization, then one can rule all accounts)


## Snowflake billing in comparison to AWS Billing Model

||AWS Organizations|Snowflake Organizations|
|-|-|-|
|*Who pays?*|Master Account|Snowflake Organization Owner|
|*Organizational Units*|Yes|No|
|*Account Breakdown*|Yes|Yes|
|*Separate Billing*|No|No|
|*Account can leave organization*|Yes|Unclear|
|*Accounts can operate in all regions*|Yes|No - Single region only|


## What are some examples?

In both examples, the individual accounts retain the ability to share resources both with accounts within and outwith the Snowflake Organization

### Multi National Corporations with Subsidiaries

Many large multi-nationals are dispersed not only geographically, but in function or capability. Others operate globally, but with regional locality (or subsidiaries).  

In a recent AWS Big Data Blog, [Toyota describe how they rolled out a serverless data lake and analytics capability](https://aws.amazon.com/blogs/big-data/enhancing-customer-safety-by-leveraging-the-scalable-secure-and-cost-optimized-toyota-connected-data-lake/), to service their burgeoning in-car telemetry data.

Reasons such as sovereignty, cost or latency may dictate that the journeys your data make within your organisation vary, depending on the region in which they originate.


### Loosely Coupled Organisations with broad purpose

A different scenario is where you have a number of organisations that are similar in function, united by purpose, yet operated and governed independently of each other (and possibly even subject to separate jurisdictions or legislation. 

In Australia, an example of this could be the [31 Primary Health Networks](https://www1.health.gov.au/internet/main/publishing.nsf/Content/PHN-Profiles) (PHNs) that locally co-ordinate the appropriate network of health providers for all Australians. Each PHN is responsible for acquisition of patient data from relevants providers, and as such collectively manage a vast potential data portfolio that is of powerful consequence to government agencies that focus on national health outcomes and policy, such as the [Australian Institute of Health and Welfare](https://www.aihw.gov.au/). 

As Australia is a federation of States and Territories, it follows that each jurisdiction can and generally does have [some of its own laws relating to privacy](https://www.oaic.gov.au/privacy/privacy-in-your-state/), especially in relation to public agencies. In these scenarios, it may be prudent for each jurisdiction to have their own Snowflake Organization that can be administered independently of those in other states.

## Patterns

It's important to note that one of Snowflake's key features - **simple cross account sharing of data** - is independent of the Snowflake Organization feature. Accounts **do not** have to belong to the same Snowflake Organization to share data. 

However, sharing can only happen within the same cloud and region combination. This is important to understand, as it effectively means you must replicate your data (**and hence pay storage again**) in order to share across the cloud / region boundaries.

I've omitted the simplest use case of a single Snowflake organization with a single account, as this is the default for most people when they onboard with Snowflake.

### Multiple Snowflake Organizations

In the following diagram, you will note that in order to share with accounts in a destination region (e.g. Tokyo), a remote organization must first replicate its data to an account in its own Snowflake Organization, before it can be shared with an account in the same destination region from another Snowflake Organization.

While there may be genuine reasons for requiring individual Snowflake Organizations, it will add complexity and likely some additional cost as well.

![Multiple Organizations](/img/blog/sos/multi-cloud-multi-org.jpg)

### Single Organization, Multiple Regions / Clouds, Multiple Accounts

This scenario is likely to be a common choice for many geographically or multi cloud businesses. It can also be an effective cross cloud / region redundancy architecture, where [databases can be failed over to alternate regions to which they are being replicated](https://docs.snowflake.com/en/user-guide/database-failover-intro.html).
![Single Organization, Multi Region](/img/blog/sos/multi-cloud-single-org.jpg)


### Single Organization, Single Region / Cloud, Multiple Accounts
This is going to be perhaps the most common pattern for many large organisations that work within a single cloud region. By working in a single cloud region, cross account sharing is supported. Master and reference data sets can be shared by a corporate account for access by all other divisional accounts within the same region.

![Single Organization, Single Cloud/Region](/img/blog/sos/single-cloudregion-single-org.jpg)

## Think about the money

How should you make sense of all this when it comes to cost? The following page lists the [associated costs of Snowflake usage]() across clouds and regions, and it has some important dimensions to consider, notably:

* On-demand credit cost varies significantly by region
* Expect to pay between $100-$200 per TB transferred out of regions, *except* within AWS regions in North America where it can be as low as $20 per TB
* Storage costs are fairly consistent globally, both across regions and clouds




## References

* [https://docs.snowflake.com/en/user-guide/secure-data-sharing-across-regions-plaforms.html](https://docs.snowflake.com/en/LIMITEDACCESS/organizations.html)
* [https://docs.snowflake.com/en/user-guide/database-replication-config.html](https://docs.snowflake.com/en/user-guide/database-replication-config.html)
* [https://docs.snowflake.com/en/LIMITEDACCESS/organizations.html](https://docs.snowflake.com/en/LIMITEDACCESS/organizations.html)
* [https://www.snowflake.com/pricing/pricing-guide/](https://www.snowflake.com/pricing/pricing-guide/)
* [https://www.snowflake.com/wp-content/uploads/2017/07/CreditConsumptionTable.pdf](https://www.snowflake.com/wp-content/uploads/2017/07/CreditConsumptionTable.pdf) (including old tiers)

