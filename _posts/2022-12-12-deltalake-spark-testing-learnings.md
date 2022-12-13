---
layout: post
font: serif
title: Databricks - An Approach To Unit Testing
date: 2022-10-27
highlight: monokai
author: Bryan Yu
image: /img/blog/databricks/databricks.png
tags: databricks deltatable dataframes spark workflows integration unit testing
description: Lets look at testing our code using delta lake and spark
---

Before we commence, please note that any examples and discussions below regarding unit testing will be focused on users who are currently writing their code in `python 3` and running orchestrations via `Databricks Workflows` as `Delta Live Tables` are a separate topic altogether. 

The following topics will be covered here as we make our way to unit testing. If you are already familiar points 1-3, them skip to the last section at the bottom `Unit Testing`: 

1. Delta Lake
2. Apache Spark & PySpark
3. Integration Testing 
4. Unit Testing


### Delta Lake


<img height="100px" src="/img/blog/databricks/delta-lake.png" />
<br/><br/>

Delta Lake is the open source storage framework providing key features such as ACID transactions and time travel features. Delta Lake is not only compatible with Spark but is also what Databricks utilises for data storage and table management. As a result the types of tables we will be dealing with for the most part are delta tables. The sotrage format of these delta tables are basically parquet files. 

You can see more details in the official docs [delta.io](https://delta.io/) if you wish to learn more. Interesting stuff!


### Apache Spark

<img height="100px" src="/img/blog/databricks/apache-spark.png" />
<br/><br/>

Apache Spark is an analytics query engine which is good for large scale and batched data workloads, machine learning and real time analytics. Long story short, Databricks is built on Spark and PySpark and hence knowledge in those areas could help quite significantly. 

Apache Spark also supports APIs for developing in R, Java, Scala and Python. This translates to Databricks as well as you find that our notebooks can be written purely as a bunch of SQL commands or in one of those languages as listed above but alas, we will be focusing on Python and PySpark (its just the python library that interfaces Apache Spark).


### Integration Testing

While integration testing on Databricks is not covered in this blog, is essential in my opnion that time and effort are still dedicated into comprehensively writing these out as well using a library like `Great Expectations`, running in a notebook and serving as an additional step at the gold layer of your workflow. This serves its purpose to verify that data quality standards are constantly met and if anything unexpected comes up, we fail the workflow and generate a detailed visual report for users to view and understand what the unexpected data is before it gets to the consumers. 

With that said, defects in data quality may appear as a consequence of the following scenarios such as regression in our data transformation logic or changes in upstream system which resulted in changes to data layout, representation, schema and so forth.


### Unit Testing

So it seems that integration tests for our data pipeline is plentiful beneficial but why not stop there? well, one of the few benefits of unit testing is that we get to rapidly ensure our `code` meets quality standards and whilst detection certain regressions earlier in the dev lifecycle which thusly give us more confidence to move faster as code can get committed and deployed more frequently. Lets now dive into the details of unit testing our code.

Admittedly, this will not be without it's own interesting challenges, as most of your notebooks will also be making calls to Databricks libraries such as the auto loader, dbutils, contexts objects and apis etc. This also includes any global calls to the spark session object. We can't really include those calls in our test suite as they would require the Databricks runtime and that is something we wont be able to spin up our local machine or CI pipeline for that matter. Conversely, what we can setup to run locally is both `Delta Live` and `PySpark/Spark`.

First call to action is to think carefully about what you want the scope of the unit tests to be. In most cases from experience it would boil down to the data transformation logic. We will have to do a bit of refactoring if necessary to isolate all logic related to Spark data frames in a single testable function while keeping the Databricks runtime libs out. We may choose to do this by having variables as fakes for those libraries passed in as arguments in the test or relocate the calls outside the function instead. 

One other thing we will definitely need to do is to make have Spark session object passed in a function argument where you run those data frame operations. This is because Databrick's global spark object will not be available outside the runtime.

The next thing to take into account is that you will always have a main loop in your notebook that immideately runs the full ingestion code when a Databricks job is kicked off and this will certainly result in invoking Databricks libs. We need to ensure this is not executed via some measures such as introducing an environment variable boolean toggle so that its
1. Set to true when it runs runs when part of the workflow 
2. Set to false when running outside the workflow 

That way we can effectively import and test just the data transformation function. We will look at more examples later.

Now that we have the overall landscape of what to expect, lets dive step by step into how we can setup and write unit tests which will run on our local machine and also in the ci/cd pipeline.


### Required Python Dependencies

For starters, assuming you already have python on ci/cd and your local machine, you will need the following bare minimum PyPI dependencies installed as well.

1. pyspark - we can just install this without requiring to install Apache Spark separately
2. delta-spark
3. pytest - alternatively, use unittest which is an in-built standard Python library

Key consideration here is to closely align the version of delta-spark and pyspark to Databricks as much as possible to try and prevent as much as possible scenarios where code may run in Databricks but fail in tests or vice versa. Few things you can do here are:

1. Check out [databricks runtime release notes](https://docs.databricks.com/release-notes/runtime/releases.html) to ensure that the version you install is closely aligned with the version of Databricks you have running

2. Check out [delta release notes](https://docs.delta.io/latest/releases.html) to ensure that delta-spark version you install is compatible with the Apache Spark version in step 1.


### Configuring Docker For Local Test Execution

Once we have the dependencies specificed in a requirements txt file or poetry toml file (if you use Poetry), the next step would be to create a docker compose solution for local development, so that it always installs a preset Python and OpenJDK versions and including pip dependencies, leaving less avenue for 'works on my machine' type of issues. This is relatively simple as you can see below:


*Dockerfile*
```
FROM python:3.9.5

RUN apt-get update && apt-get install openjdk-11-jdk -y
RUN pip3 install -r requirements.txt

CMD export PYSPARK_SUBMIT_ARGS='--packages io.delta:delta-core_2.12:2.2.0 pyspark-shell' \
    pytest path/to/tests/**/*
```

If you are wondering why theres no Apache setup steps above, then remember that we are will be installing pyspark via pip instead which will suffice for local development activities. 

Most of the other config is stock standard, with the exception of the `PYSPARK_SUBMIT_ARGS`. Its one of those things you need to set to run these tests as a workaround certain known issues with running locally. At the end of the day, these are just arguments that end up being supplied to `spark submit` which is a script that Spark uses to launch apps on a cluster. 

Why you might still ask? well, the purpose behind each argument is as follows:

1. io.delta:delta-core_2.12:2.1.0 - defines the maven artifact dependency of delta-core_2.21 for the version 2.1.0. You must match the version with precisely what you defined as the `delta-spark` pip dependency. If you are not sure about the artifact name, here is a reference: https://mvnrepository.com/artifact/io.delta/delta-core. The artifact name will be different but the version is whats important.

2. pyspark-shell specifies to use the pyspark java class when running spark jobs locally. 


*docker-compose.yml*
```
version: "3.9"

services:
  test:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: test
    volumes:
      - .:/src
```

Then we just need to run docker-compose up to re-run the tests whenever we make changes or create new ones locally. Of course, the volume mount in the compose file will depend on your project structure.


### Create Configure Spark Session In Test Hook

At this point, we can focus on what the code requires. We will need a before hook that configures our local spark session so our tests can use it. This implication here is that any delta tables that created will be placed our local file system, but thats the advantage of it I guess when it comes to testability.

In your before hook for all tests, you will need to create a local spark session object (see code below). What's important is that we use `configure_spark_with_delta_pip` to ensure that the Delta Lake Maven JARs are installed and is hence one of the few reasons why we specified the `delta-spark` dependency to begin with. 

```
from pyspark.sql.session import SparkSession
from delta import configure_spark_with_delta_pip
import pytest

@pytest.fixture(scope="session")
def spark():
    builder = SparkSession.builder.appName("local-spark-session").config("spark.sql.extensions", "io.delta.sql.DeltaSparkSessionExtension").config("spark.sql.catalog.spark_catalog", "org.apache.spark.sql.delta.catalog.DeltaCatalog")

    return configure_spark_with_delta_pip(builder).getOrCreate()
```

See the docs local [delta lake setup](https://docs.delta.io/latest/quick-start.html#python) if you wish to learn more.

### Writing Test

If you have come this far, we have one last task at hand. That is adapting our notebook code to be testable. The easiest way to show this is via before and after comparison of what a typical structure would be vs post refactoring

So lets say we have a hypothetical scenario where we want to test a transformation function we have written that takes a dataframe containing a list of people and we want to filter out where their date of birth is equal to or greater than 01 Jan 1991, we can structure our code as below.


*databricks_notebook.py*
```
import pyspark.sql.functions as F
from os import env

def transform_dataset(df):
    return df.select("name", "dob").where(F.col("dob") >= F.lit("1999-01-01") )

def run_main_loop():
    # run main job here

try:
    is_live = dbutils.widgets.get("is_live").lower() == "true"

except Exception as e:
    print(f'There was an issue initialising parameters. {e}')
    is_live = False

if is_live == True:
    run_main_loop()
```

It firstly attempts to use Databrick's global dbutils to get configuration parameters. If that succeeds then we run the main loop, else it would throw an exception of undefined variable access and we just treat this notebook as offline mode so to speak.

So when we get to a stage of writing our unit test, we can import this file as such:

*databricks_notebook_test.py*
```
import pyspark.sql.types as T
from databricks_notebook import transform_dataset
import pyspark.sql.functions as F
from datetime import date

def transform_dataset(df):
    return df.select("name", "dob").where(F.col("dob") >= F.lit("1999-01-01") )

def test_date_filter(spark):
    schema = T.StructType([
        T.StructField("name", T.StringType(), True),
        T.StructField("dob", T.DateType(), True),
    ])

    data = [
    (
        "John",
        date(1978, 5, 8)
    ),
    (
        "Tim",
        date(1999, 2, 8)
    ),
    (
        "James",
       date(1996, 6, 9)
    )]
    
    df = spark.createDataFrame(data=data, schema=schema)
    transformed_df = transform_dataset(df)

    results = transformed_df.collect()
    
    assert len(results) == 1
    assert results[0]["name"] == "Tim"
   

```

### Troubleshooting

Q: I've got the latest version of Python but I am receiving error such as `_pickle.PicklingError: Could not serialize object: IndexError: tuple index out of range` when I run my tests... halp!

A: Check the Py readiness docs https://pyreadiness.org/3.11/ to see that PySpark is supported for the desired python version (i.e. 3.11).


### Conclusion

Well thats about it!, hope this was helpful by some measure. 

As a final note, you can expand the scope of your test if you wish by importing the code that creates your destination table for the initial setup, then running the function that transforms and merges the data in there. 
