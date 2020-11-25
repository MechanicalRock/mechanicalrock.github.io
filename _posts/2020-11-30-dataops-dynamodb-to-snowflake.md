---
layout: post
title: Batch ELT from AWS DynamoDB to Snowflake
date: 2020-11-30
tags: snowflake dynamodb aws data elt s3
author: Paul Symons
image: img/blog/dynamodb-to-snowflake/logo.jpg
---
<style type="text/css">
  @media only screen and (min-width: 1000px) {
    h2, h3 {
      margin-top:1em;
    }
    div.wrapper { 
      max-width:900px;
    }
  }
</style>

In this article we are going to discuss a new way to batch load your DynamoDB tables directly into Snowflake without proprietary tools. But first...

## Why DynamoDB is so popular

AWS DynamoDB is a cloud native NoSQL database service, renowned for its performance and stability. In fact, in a [recent AWS blog post about Prime Day](https://aws.amazon.com/blogs/aws/amazon-prime-day-2020-powered-by-aws/), it is claimed it sustained a peak load of 80 million requests per second! Whilst most customers are unlikely to reach that level of sustained throughput, it demonstrates the extent to which the service is designed to scale.

There are [a wide range of database options](https://aws.amazon.com/products/databases/) on offer from AWS for different workloads, yet [RDS](https://aws.amazon.com/rds/) and [DynamoDB](https://aws.amazon.com/dynamodb/) are by far the most established and with the most mature capabilities to support mainstream and high performance requirements. Both are easily scaled and highly available across multiple availability zones, and even multiple geographical regions. One key differentiator, however is cost model - RDS attracts an [hourly pricing model](https://aws.amazon.com/rds/aurora/pricing/) for compute, irrespective of actual demand, whilst DynamoDB charges you only for what you use.

NoSQL databases are often regarded for their *schemaless* capabilities that - as well as offering flexibility - demand tolerant applications as data structures evolve over time. With AWS DynamoDB in particular, much attention has been paid to [single table designs](https://www.serverlesslife.com/DynamoDB_Design_Patterns_for_Single_Table_Design.html) in recent years that optimize read and write patterns in order to effectively allow multiple domains of data within a single table. 

### Integrating with Data Warehouses
Despite providing flexibility for transactional data users, NoSQL tables often present challenges for analytics teams. It can be difficult to transform semi-structured data to the relational table format found in data warehouses,  or make sense of sparse data patterns commonly used in single table designs.

In this article I will to show you how to successfully integrate DynamoDB data with [Snowflake](https://www.snowflake.com), in a **cost-effective** and **cloud native** way. We will tackle both the sparse data and semi-structured data challenges, using plain old SQL.

### What has changed?

Until very recently, getting bulk data out of AWS DynamoDB typically required the use of either specialised vendor or cloud provider tools (e.g. AWS Data Pipeline), or invest a lot of your own engineering effort to extract the data yourself. In any case, there was no out-of-the-box feature that could dump a DynamoDB table for export, without having a performance, cost or engineering impact. 

In November 2020, AWS DynamoDB has released a new feature to [export the contents of a table to S3](https://aws.amazon.com/blogs/aws/new-export-amazon-dynamodb-table-data-to-data-lake-amazon-s3/) without performance impact, leveraging *Point-In-Time-Recovery* (PITR). The cost for this serverless feature is based only on the volume of data that you export, priced at $0.114 per GB in the AWS Sydney region.

This feature - which many would say is long overdue - may be a very welcome feature for those working with data lakes and data warehouses, as it allows for very simple cloud native integrations with your DynamoDB data:
* **Snowflake** has excellent support for [External Tables](https://docs.snowflake.com/en/user-guide/tables-external-intro.html) that read directly from external stages as well as [table hydration from external stages](https://docs.snowflake.com/en/user-guide/data-load-s3-copy.html) for better query performance

* **Amazon Redshift** has good support for [integrating data from DynamoDB](https://docs.aws.amazon.com/redshift/latest/dg/t_Loading-data-from-dynamodb.html), however, this latest feature may allow teams leveraging older methods to consolidate and simplify their data access patterns, whilst also eliminating load from their operational tables

At the time of writing, the new export functionality is only available in the AWS DynamoDB V2 console, though it is expected this V2 console will shortly become the default, once it is feature complete. It is also available in SDK libraries and using the AWS Command Line Interface (CLI).

**It would be great to see AWS DynamoDB Export evolve to support writing to S3 Access Points instead of only bucket destinations; this would reduce the operational burden and risk of managing cross account S3 access.**


### What will we learn?

The outcomes of this article are to demonstrate how to:
* Schedule a **regular export of your DynamoDB table to S3**
* **Understand export structures and metadata**, and how to use it effectively to work with multiple export copies
* **Transform raw data exported** from DynamoDB into multiple tables to meet your requirements.

The goal is to provide analysts both the data they need in the structure they expect, combined with the visibility and techniques to adapt it over time, as the data changes.

## Our Scenario

> &#9432; &nbsp; All source code and data files for this blog post are available in the [dynamo db export to snowflake](https://) repository.

This demonstration will use weather data from [Australia's Bureau of Meteorology](http://www.bom.gov.au/climate/data-services/) (BOM). They have a variety of data available from local weather stations, which is helpful for constructing an example of a single table design based on facts such as:
* Maximum Temperature
* Rainfall
* Solar Exposure
* Generalised Weather records

I have made only basic changes to the (included) original data files to simplify the importing of data into DynamoDB. Data is centered around a `YYYY-MM-DD` date dimension.

### Architecture

The diagram below describes the architecture we will be working with.

![Architecture of AWS DynamoDB Export to S3, read by Snowflake](/img/blog/dynamodb-to-snowflake/architecture.png)

In summary, we:
* **Use CDK to create our AWS infrastructure stack**:
  * AWS DynamoDB table
  * Lambda to trigger DynamoDB export
  * S3 Storage Bucket
  * Snowflake access role
* **Import CSV data to DynamoDB** using [ddbimport](https://github.com/a-h/ddbimport) 
* Create a selection of Snowflake views accessing the staged data directly, to **break out our single table design into relational tables**

The first two points are covered in the code repository linked above; the rest of this article will focus on accessing the data written by the export process.

## Exporting The Data

Below is a screenshot of the sparse data from DynamoDB's new item explorer, to help us visualise the problem we are trying to solve. Note the absence of values in some columns - this is common in single table designs as each row may represent a different kind of data entity.


![Screenshot of DynamoDB Item Explorer showing sparse data in a single table design](/img/blog/dynamodb-to-snowflake/sparse-weather-data.png)


### Successive DynamoDB exports to S3

As described in the architecture earlier, we run the DynamoDB export every 24 hours. Observe how each export gets its own folder; it is self contained and stores all of the files managed by an invocation of the export process, as we will see later:

![Screenshot of S3 folders, one for each export by DynamoDB](/img/blog/dynamodb-to-snowflake/s3-exports.png)

### Export Structure

If you have ever enabled [inventory reports](https://docs.aws.amazon.com/AmazonS3/latest/dev/storage-inventory.html) for one of your S3 buckets, then the pattern followed by DynamoDB Exports will be familiar to you. The following is written for each export performed:
- A manifest file containing a summary of the export process
- A manifest file containing a list of data files containing the DynamoDB table data
- A number of data files containing segments of the DynamoDB table data

![Screenshot of S3 objects written by a single DynamoDB export](/img/blog/dynamodb-to-snowflake/s3-export-detail.png)

### Cleaning Up Old Exports

In order to appropriately manage storage used, a lifecycle rule is introduced to delete files older than 3 days from this export folder:

```javascript
  bucket.addLifecycleRule( {
      enabled: true,
      expiration: cdk.Duration.days(3),
      prefix: exportPrefix,
      id: 'delete-objects-after-3-days'
  });
```
This will prevent us accruing costs on old exports of the DynamoDB table that we do not need.


## Normalizing The Data

Now that we have our DynamoDB table regularly exporting to S3, it's time to see how we can read that data in Snowflake.

### Listing files in the Snowflake stage

If you have set your stage up correctly, you won't need to use the S3 console to view the exported objects. You can use the following command to show what objects are visible in the Snowflake External Stage:

```sql
list @DYNAMODB_SNOWFLAKE_BLOG;
```

![List of objects from the S3 bucket as seen in Snowflake by running LIST command on the stage](/img/blog/dynamodb-to-snowflake/snowflake-list-stage.png)

The objects listed in the results should be familiar to you, now that you understand the structure of each DynamoDB table export. How can we find out more about an export, though?


### Reading Metadata

Let's start with the manifest summary: it provides data about the export process. 

You can specify a `PATTERN` when listing files, to show only objects with names matching a particular pattern.
```sql
list @DYNAMODB_SNOWFLAKE_BLOG PATTERN=".*manifest-summary\.json$";
```

![List of only manifest files from the S3 bucket as seen in Snowflake by running LIST command with a PATTERN](/img/blog/dynamodb-to-snowflake/snowflake-list-stage-manifest-files.png)

This has provided us the list of manifest summary files only, but how can we see what kind of information these files contain? Let's just do a `SELECT`!


### Inspecting the manifest summary data with SELECT statements

In Snowflake you can easily run `SELECT` queries [directly against staged data](https://docs.snowflake.com/en/user-guide/querying-stage.html) - let's try the following example:

```sql
SELECT $1 FROM @DYNAMODB_SNOWFLAKE_BLOG (PATTERN=> ".*manifest-summary\.json$");
```
![Screenshot of Snowflake failing because we didn't specify the file format](/img/blog/dynamodb-to-snowflake/snowflake-select-stage-first-try.png)

Oh dear! It didn't work - but it gave us a good clue as to why: *DynamoDB Exports write their metadata uncompressed*. To address this issue, we need to create a `FILE FORMAT` that specifies uncompressed data, and then use that file format in our `SELECT` statement:

```sql
CREATE FILE FORMAT PLAINJSON TYPE=JSON COMPRESSION=NONE;
SELECT $1 FROM @DYNAMODB_SNOWFLAKE_BLOG (PATTERN=> ".*manifest-summary\.json$", FILE_FORMAT=>PLAINJSON);
```
![Screenshot of raw json read back from stage files](/img/blog/dynamodb-to-snowflake/snowflake-select-stage-raw-data.png)

And if you click on the data you can see a prettified preview like this:
![Screenshot of formatted raw json preview](/img/blog/dynamodb-to-snowflake/snowflake-select-stage-raw-data-preview.png)

As you can see, there is useful information in there:
* Export Time
* Total number of items exported
* Manifest file key (which we can use to determine the prefix for this specific export)

### Take only what you need

So if you noticed before, we use the `$1` magic column to return the entire raw data from each row - but you can be much more specific:
```sql
select 
    -- this returns the s3 object key containing the original data
    metadata$filename as filename, 
    SPLIT_PART(filename,'manifest-summary.json',1) as filepath, --
    $1:exportTime::TIMESTAMP_NTZ as exported,
    SPLIT_PART($1:manifestFilesS3Key,'manifest-files.json',1) as dumpPath
  FROM @DYNAMODB_SNOWFLAKE_BLOG/export/AWSDynamoDB (PATTERN=> ".*manifest-summary\.json$", FILE_FORMAT=>PLAINJSON)
  ORDER BY exported DESC LIMIT 1;
```
![Screenshot of raw data presented in relational format](/img/blog/dynamodb-to-snowflake/snowflake-select-stage-export-details.png)

Why is this important? Because it forms the basis of queries that allows us to always work with the latest dynamodb export on S3.


### Showing The Latest Data

Now that we have the path to the latest data, here is a query that can provide us the raw data from the latest export:

```sql
WITH themanifest AS (
  SELECT
    metadata$filename as filename,
    SPLIT_PART(filename,'manifest-summary.json',1) as filepath,
    $1:exportTime::TIMESTAMP_NTZ as exported,
    SPLIT_PART($1:manifestFilesS3Key,'manifest-files.json',1) as dumpPath
  FROM @DYNAMODB_SNOWFLAKE_BLOG/export/AWSDynamoDB (PATTERN=> ".*manifest-summary*.json", FILE_FORMAT=>PLAINJSON)
  ORDER BY exported DESC LIMIT 1
),
realdata AS (
    SELECT metadata$filename AS datafile,$1 AS datajson FROM @DYNAMODB_SNOWFLAKE_BLOG/export/AWSDynamoDB (PATTERN=> ".*json.gz")
)
select r.datafile,r.datajson from realdata r
join themanifest t on startswith(r.datafile,t.filepath);
```
![Screenshot showing data from the latest dynamodb export only](/img/blog/dynamodb-to-snowflake/snowflake-select-real-data.png)



Again, clicking on the data gives a prettified JSON of one of the records:
```json
{
  "Item": {
    "Day": {
      "S": "15"
    },
    "Month": {
      "S": "11"
    },
    "Year": {
      "S": "1969"
    },
    "bom_station_number": {
      "S": "9106"
    },
    "data_type": {
      "S": "weather_rainfall"
    },
    "event_date": {
      "S": "1969-11-15"
    },
    "pk": {
      "S": "weather_rainfall-1969-11-15"
    },
    "product_code": {
      "S": "IDCJAC0009"
    },
    "quality_bool": {
      "S": "Y"
    },
    "rainfall_mm": {
      "S": "0"
    }
  }
}
```

### Iteratively Building Views 

At this stage, we can create a view of the raw data by simply prefixing the previous query with something like:
```sql
CREATE OR REPLACE VIEW weather_data_raw_latest AS
  ...
;
```

Everything we do now is going to be an iteration from this view, and the ones that follow.

```sql
CREATE OR REPLACE VIEW weather_solar_exposure_raw AS
  SELECT * FROM weather_data_raw_latest WHERE datajson:Item.data_type.S = 'weather_solar_exposure';

CREATE OR REPLACE VIEW weather_rainfall_raw AS
  SELECT * FROM weather_data_raw_latest WHERE datajson:Item.data_type.S = 'weather_rainfall';

CREATE OR REPLACE VIEW weather_tempmax_raw AS
  SELECT * FROM weather_data_raw_latest WHERE datajson:Item.data_type.S = 'weather_tempmax';

CREATE OR REPLACE VIEW weather_summary_raw AS
  SELECT * FROM weather_data_raw_latest WHERE datajson:Item.data_type.S = 'weather_summary';
```

By creating separate views for each of the different `data_type` fields, we have essentially normalized the different data entities from the DynamoDB single table design.

Now, let's create a view to turn the raw data in to a standardised relational form:

```sql
 CREATE OR REPLACE VIEW weather_solar_exposure AS
   SELECT
      datajson:Item.bom_station_number.S::STRING AS bom_station_number,
      datajson:Item.daily_global_solar_exposure_MJ_per_m2.S::NUMBER AS daily_global_solar_exposure_MJ_per_m2,
      datajson:Item.event_date.S::DATE AS event_date,
      datajson:Item.product_code.S::STRING AS product_code
      FROM weather_solar_exposure_raw;
```

Once views like these are created, data has been transformed to a format suitable for further transformation, or consumption by analytics teams:

![Screenshot of SELECT query against a view that presents raw data in relational form](/img/blog/dynamodb-to-snowflake/snowflake-relational-data.png)

Now each data item has its own column, and is of the correct data type. There are a number of advantages to what we have done here:

* additions to DynamoDB row attributes (i.e. schema) will not break these views as they only read what they are looking for
* incorporating new fields is as simple as re-creating the view with the new field specified
* Casting errors or new data attributes can be discovered from the original raw data views

### Visualising The Data

Having gone to the trouble to make our data available in Snowflake, we may as well show it off with a small chart.

Let's make a table that joins the datasets on the `event_date` field:

```sql
CREATE OR REPLACE TABLE materialized_longterm_weather_stats AS
  SELECT 
      s.event_date,
      x.daily_global_solar_exposure_MJ_per_m2,
      r.rainfall_mm,
      r.rainfall_period_days,
      t.temp_max_c,
      s.sunshine_hrs,
      s.time_0900_wind_direction,
      s.time_0900_wind_speed_kmh
  FROM weather_summary s
  JOIN weather_rainfall r ON r.event_date=s.event_date
  JOIN weather_solar_exposure x ON x.event_date=s.event_date
  JOIN weather_tempmax t ON t.event_date=s.event_date
```

Then simply run a query to visualise the data using Snowflake's built in data exploration tool, [SnowSight](https://docs.snowflake.com/en/user-guide/ui-snowsight.html): 

![Screenshot of a graph created by Snowflake's Snowsight Data Exploration UI](/img/blog/dynamodb-to-snowflake/snowsight.png)

## Performance and DataOps

### Performance Considerations: When To Ingest

You will notice in these examples we have not actually ingested any data to Snowflake - we have simply wrapped schema around data that resides on our own S3 bucket.

Snowflake does a great job of caching results from staged data to improve performance, but as soon as your Virtual Warehouse spins down, it will have to re-read that data from S3. This can be both slow and costly, when you have a significant volume of data.

There are a couple of options available
- Ingest the data at some point by running a `COPY INTO` or *CTAS* statement
- Create a [Materialized View](https://docs.snowflake.com/en/user-guide/views-materialized.html)

Both of these will be effective though there are complications and cost considerations with materialized views that often make it simpler to `COPY INTO` a new table.

### DataOps

When working with production systems, you don't want to be creating views in your SQL workbench.

* Use a [DataOps Pipeline](https://mechanicalrock.github.io/2020/11/03/snowflake-dataOps.html) to setup and manage your Cloud Data Warehouse.
* Materialize and Transform your data with a tool like [DBT](https://www.getdbt.com/) once it is available in your warehouse.

More on that in a future blog post!

## Conclusion

In this article we have demonstrated 

* How simple exporting DynamoDB tables to S3 can be with the new export feature
* How to work with staged files using Snowflake
* How to normalize semi-structured data into relational views in Snowflake

[Get in touch with us at Mechanical Rock](https://www.mechanicalrock.io/our-expertise/automated-data-platforms/) to grow your analytics engineering capabilities to the next level!








