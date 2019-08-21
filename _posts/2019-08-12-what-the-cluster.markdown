---
layout: post
title:  "Snowflake: What the cluster"
date:   2019-08-12
tags: snowflake
author: Natalie Laing
image: img/snow.jpg
---
![Snowflake Unicorn](/img/blog/what-the-cluster/Uni-Snowflake.png)

I recently attended a Snowflake 4 day partner bootcamp in Melbourne to get some hands on experience with Snowflake.

* Snowflake is a data warehouse built for the cloud that can handle structured and semi-structured data. Snowflake supports an unlimited number of simultaneous users so multiple groups of users can access data at the same time with no performance degradation.
* Snowflake is a zero-management data warehouse-as-a-service.
* Snowflake deals with all the parts of setting up a data warehouse solution so you don’t have to; you get to play with all the bells and whistles to tune snowflake into your ideal data warehouse solution.
* Snowflake deals with all the management and setting up of your data warehouse so you can focus on the processes you care about.
* Snowflake comes with a fail safe which stores your historical data. This is non configurable and only accessible by contacting Snowflake support. Snowflake will take a copy of all tables, views, etc and store this for seven days and is only to be used to retrieve data in a case of damage or system failure. You get a seven day fail safe as default and this feature can’t be turned off.
* You can share your tables and materialized views with consumers who do not have a snowflake account by using reader accounts.


One of the reoccurring themes was clusters. Snowflake uses the term cluster a lot!

### Data Cluster

This is how data is ordered and sorted in micro-partitions. Snowflake will cluster your data automatically into micro-partitions to allow for faster retrieval of frequently requested data.Micro-partitions is Snowflakes unique way of storing large amounts of data in a way that enables fast retrieval of frequently accessed data. Micro-partitions are immutable , compressed and encrypted at rest.
You can evaluate how your table is clustered by looking at certain columns that your users will interface with.

```sql
SELECT
SYSTEM$CLUSTERING_INFORMATION('UNICORNS','(SIZE,AGE)');
```

### Compute Cluster

A compute cluster is a collection of one or more VMs connected within a mesh. All virtual warehouses are an independent compute cluster which does not share its resources with other compute clusters. As each compute cluster does not share compute resources all other virtual warehouses will have no impact on eachother.As a standard for your warehouse you will only have a single compute cluster meaning you are unable to scale out, if you need more than one compute cluster you would need to utilise the multi cluster warehouses.

### Cluster Keys

Used to help keep all frequently accessed data in the same micro-partition for faster retrieval. This is only ideal for very large tables as snowflake automatically clusters your data into micro-partitions . Using cluster keys will override snowflakes natural clustering.
So say you want to find unicorns; you want to know how old they are, how big they are and where they were last spotted. This is the information you need to go forth and find unicorns so you want this information to be stored in the same micro-partition so you can get hold of this vital information fast.
Cluster keys are used to keep frequently accessed data in the same micro-partition.So if I wanted to re cluster my UNICORNS table from above I could set clustering keys on AGE,SIZE and LOCATION.

```sql
ALTER TABLE UNICORNS CLUSTER BY (AGE,SIZE,LOCATION);
ALTER TABLE UNICORNS RECLUSTER;
```

### Multi Cluster Warehouses

Multi cluster warehouses can automatically scale out and spin up more compute clusters based on user concurrency needs. With multi cluster warehouses you can configure the minimum and maximum number of server clusters up to a maximum of ten. Snowflake documentation is really good and you can find out how much multi cluster warehouses will cost you in credits in different scenarios [here:](https://docs.snowflake.net/manuals/user-guide/warehouses-multicluster.html)
The two scaling strategies allow you to run using mazimized clusters, when you start your warehouse it will automatically use all the clusters.Alternatively you can use the auto scaling strategy so that clusters will be started up only when they are needed.

Setting up your warehouse is as simple as: 
```sql
CREATE OR REPLACE WAREHOUSE UNICORN_WH
WAREHOUSE_SIZE = 'SMALL'
AUTO_RESUME = TRUE
MIN_CLUSTER_COUNT = 1
MAX_CLUSTER_COUNT = 5
INITIALLY_SUSPENDED = TRUE
COMMENT = 'unicorn finder';
```

### Wrapping up

Snowflake is a fast and powerful data warehousing solution with a lot of terminology to get your head around. Once you do you can start designing your own solution, do you need a single compute cluster or a multi cluster warehouse? Now that you know about all the different Snowflake clustering terms, you can start Snowflaking for yourself.Still not sure? We would be more than happy to help you.

Go forth and cluster.

If you think we can help you cluster unicorns in Snowflake, feel free to [contact-us](https://www.mechanicalrock.io/lets-get-started)

### References

[https://docs.snowflake.net/manuals/user-guide/warehouses-multicluster.html](https://docs.snowflake.net/manuals/user-guide/warehouses-multicluster.html)
[https://docs.snowflake.net/manuals/user-guide/intro-key-concepts.html](https://docs.snowflake.net/manuals/user-guide/intro-key-concepts.html)
