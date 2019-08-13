---
layout: post
title:  "Snowflake: What the cluster"
date:   2019-08-12
tags: snowflake
author: Natalie Laing
image: img/snow.jpg
---

I recently attended a Snowflake 4 day partner bootcamp in Melbourne to get some hands on experience with Snowflake.

Snowflake is a data warehouse built for the cloud that can handle structured and semi-structured data. Snowflake supports an unlimited number of simultaneous users so multiple groups of users can access data at the same time with no performance degradation.

Snowflake is a zero-management data warehouse-as-a-service. 

Snowflake deals with all the parts of setting up a data warehouse solution so you don’t have to; you get to play with all the bells and whistles to tune snowflake into your ideal data warehouse solution.

You get a 7 day fail safe as default, this feature can’t be turned off. If you need access to your seven day back up then you will need to phone snowflakes support. You can share your tables and materialised views with consumers who do not have a snowflake account by using reader accounts.

Snowflake deals with all the management and setting up of your data warehouse so you can focus on the processes you care about.

One of the reocurring themes was clusters. Snowflake uses the term cluster a lot! 

### Data Cluster

This is how data is ordered and sorted in micro-partitions. Snowflake will cluster your data automatically into micro-partitions to allow for faster retrieval of frequently requested data.
You can evaluate how your table is clustered by looking at certain columns that your users will interface with.

```
SELECT
SYSTEM$CLUSTERING_INFORMATION('UNICORNS','(SIZE,AGE)');
```

### Cluster Keys

Used to help keep all frequently accessed data in the same micro partition for faster retrieval. This is only ideal for very large tables as snowflake automatically clusters your data into micro-partitions . Using cluster keys will override snowflakes natural clustering.

So you want to find unicorns, you want to know how old they are, how big they are and where they were last spotted. 
This is the information you need to go forth and find unicorns so you want this information to be stored in the same micropartition so you can get hold of this vital information fast.

Cluster keys are used to keep frequently accessed data in the same micro partition.

So if I wanted to re cluster my UNICORNS table from above I could set clustering keys on AGE,SIZE and LOCATION.

```
ALTER TABLE UNICORNS CLUSTER BY (AGE,SIZE,LOCATION);
ALTER TABLE UNICORNS RECLUSTER;
```

### Compute Cluster

A compute cluster is a collection of one or more VMs connected within a mesh. When a warehouse size goes up the number of clusters go up, a cluster is equal to eight threads.


### Multi Cluster Warehouses

Multi cluster warehouses can automatically scale out and spin up more compute clusters based on user concurrency needs. With multi cluster warehouses you can configure the minimum and maximum number of server clusters up to a maximum of ten. Snowflake documentation is really good and you can find out how much multi cluster warehouses will cost you in credits in different scenarios [here:](https://docs.snowflake.net/manuals/user-guide/warehouses-multicluster.html)

Go forth and cluster.

If you think we can help you cluster unicorns in Snowflake, feel free to [contact-us](https://www.mechanicalrock.io/lets-get-started)

### References
[https://docs.snowflake.net/manuals/user-guide/warehouses-multicluster.html](https://docs.snowflake.net/manuals/user-guide/warehouses-multicluster.html)
