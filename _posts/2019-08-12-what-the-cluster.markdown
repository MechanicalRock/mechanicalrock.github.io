---
layout: post
title:  "Snowflake: What the cluster"
date:   2019-08-12
tags: snowflake
author: Natalie Laing
image: todo
---

## Snowflake: What the cluster

## What is Snowflake: 
Snowflake is a data warehouse built for the cloud that can handle structured and semi-structured data Snowflake supports an unlimited number of simultaneous users so multiple groups of users can access data at the same time with no performance degradation. Snowflake is a zero-management data warehouse-as-a-service.Snowflake deals with all the management and setting up of your data warehouse so you can focus on the processes you care about.

Snowflake deals with all the parts of setting up a data warehouse solution so you don’t have to, you get to play with all the bells and whistles to tune snowflake into your ideal data warehouse solution.

You get a 7 day fail safe as default, this feature can’t be turned off. If you need access to your seven day back up then you will need to phone snowflakes support. You can share your tables and materialised views with consumers who do not have a snowflake account by using reader accounts.

## Getting started 
Getting your hands dirty with snowflake is simple because snowflake have set up public data set for you to play with.

```
USE ROLE PUBLIC;
USE WAREHOUSE DEMO_WH;
USE DATABASE SNOWFLAKE_SAMPLE_DATA; 
USE SCHEMA WEATHER;
```

You can use the public role, demo warehouse, database and schema.

## What is the problem and why do we need snowflake? 



## So what is all the cluster about? 
Snowflake uses the term cluster a lot, so how do you get your head around all the clusters??? 

## Data Cluster: 
This is how data is ordered and sorted in micro-partitions . Snowflake will cluster your data automatically into micro-partitions  to allow for faster retrieval of frequently requested data.

## Cluster Keys: 
Used to help keep all frequently accessed data in the same micro partition for faster retrieval. This is only ideal for very large tables as snowflake automatically clusters your data into micro-partitions . Using cluster keys will override snowflakes natural clustering. So for example you have a large table on pizzas and you want to query all pizzas with tomato and meatballs. Almost all pizzas will have tomato as the base but you are also looking for meatballs, so all records with both tomatoes and meatballs will be clustered into the same micro partition for faster retrieval (Obviously pizzas are never going to be a “large” table but for arguments sake). Cluster keys are used to keep frequently accessed data in the same micro partition.

## Compute Cluster:
A compute cluster is a collection of one or more VMs connected within a mesh. When a warehouse size goes up the number of clusters go up,  a cluster is equal to eight threads.

## Multi Cluster Warehouses: 
Multi cluster warehouses can automatically scale out and spin up more compute clusters based on user on concurrency needs. With multi cluster warehouses you can configure the minimum and maximum number of server clusters up to a maximum of ten. Snowflake documentation is really good and you can find out how much multi cluster warehouses will cost you in credits in different scenarios [here:](https://docs.snowflake.net/manuals/user-guide/warehouses-multicluster.html)

I highly recommend reading the [snowflake documentation](https://docs.snowflake.net/manuals/user-guide.html)

Go forth and cluster.


If you think we can help you, feel free to [contact-us](https://www.mechanicalrock.io/lets-get-started)