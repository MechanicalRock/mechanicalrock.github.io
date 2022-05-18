---
layout: post
title: "Data pipelines in Databricks"
date: 2022-05-12
tags: Databricks data testing
author: Natalie Laing
image: /img/code.jpg
---

# Data pipelines in Databricks

## Introduction

<br />

What is a data pipeline in Databricks?

A data pipeline is only concerned with the transformation of Databricks job code, this usually consists of moving data from bronze to gold classification.

- Bronze
  - Ingest raw data.
- Silver
  - Deduplicate data.
  - Perform transformations on data.
- Gold
  - Perform business-specific transforms to data.
  - Data should be ready for consumption.

To achieve this in Databricks you will need to leverage multi-task jobs. Multi-task jobs allow you to set your bronze - silver layer dependencies and run the pipeline in that set sequence.
This allows you to have a single workflow or parallel workflows so you can build your data pipeline in a way that suits your individual needs.

Databricks enables you to run your data pipeline on a schedule that is as simple as setting up a cron job in your IaC. The alternative is to go into the Databricks UI and manually trigger your data pipeline.

## Alerts

<br />

How will I know if the pipeline failed?

One way to find out is to navigate to the Databricks UI and check under workflows > _Your job name_ > status column.

![https://docs.databricks.com/data-engineering/jobs/jobs.html](/img/blog/databricks-data-pipeline/job-details.png)

Databricks enables you to send pipeline failure notifications to an email list.

![https://docs.databricks.com/data-engineering/jobs/jobs.html](/img/blog/databricks-data-pipeline/job-alerts.png)

If you want to enable slack notifications you will need to add some custom code to your notebook.

## Testing

<br />

Tests can be incorporated into the data pipeline, this enables you to fail the pipeline if any of your tests fail.
This allows you to have greater confidence in your data, if your silver tests fail then your gold table will not be generated with bad data.

Once you identify a broken test you can then go in and fix any issues and re-start the pipeline.

### Great expectations

![https://docs.greatexpectations.io/docs/](/img/blog/databricks-data-pipeline/GE.png)
One of the testing tools used was great expectations for data quality testing and this was incorporated directly into the data pipeline unlike the unit tests.

This allowed us to test for some of the following:

1.  Define what columns we expect to see in the table.

```py
my_test_table.expect_table_columns_to_match_set(columns_set=['col_1', 'col_2', 'col_3'],exact_match=True, result_format='COMPLETE')
```

2. Define any specific values we expect a column to contain.

```py
my_test_table.expect_column_values_to_be_in_set(column = 'col_1', value_set=['Rottweiler', 'Jack Russell', 'Pomeranian','Husky'],result_format='COMPLETE')
```

3. Define any columns that should not contain null values.

```py
my_test_table.expect_column_values_to_not_be_null(column = 'col_2')
```

4.  Define any columns that should contain a unique value.

```py
my_test_table.expect_column_values_to_be_unique(column = 'col_3')
```

More about great expectations test suite can be found [here](https://docs.greatexpectations.io/docs/terms/expectation).

## How to

<br />

This example will be using Terraform.

You will need:

- A file to declare your notebook definitions.
- A file to declare your pipeline.

<br />

### Notebook Definitions

<br />

A notebook definition file is where you declare your notebook resources.

<br />

```py
resource "databricks_notebook" "my-notebook"{
  path = "absolute-path"
  language = "PYTHON"
}
```

### Pipeline Declaration

<br />

Below is a basic example of where to start when creating your data pipeline using multi-task jobs.
The key thing to note is that you can have multiple tasks and tasks can depend on other tasks.

```py
resource "databricks_job" "my pipeline" {
  name = "my-pipeline-name"

  schedule {
    quartz_cron_expression = "my-cron-schedule"
    timezone_id = "Java-timezone-id"
  }
  task {
    task_key = "task_1"

    notebook_task {
      notebook_path = databricks_notebook.path
    }

  }
  task {
    task_key = "task_2"

    depends_on {
      task_key= "task_1"
    }

    notebook_task {
      notebook_path = databricks_notebook.path
      base_parameters = {
        *
        variables used in notebook e.g.
        env = "DEV"
        table = "my-test-table"
        *
      }
    }
  }
}
```

### How might this look?

<br />

![test](/img/data_pipeline_examples.png)

### Wrapping up

<br />

Setting up a data pipeline is only the first step, you want to build it once and build it right.

If you think we can help you set up your data pipeline the right way, feel free to [contact-us](https://www.mechanicalrock.io/lets-get-started).

<br/>

#### References

[Great Expectations image](https://docs.greatexpectations.io/docs/)

[Great expectation job image](https://docs.databricks.com/data-engineering/jobs/jobs.html)
