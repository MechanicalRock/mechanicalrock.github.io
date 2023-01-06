---
layout: post
font: serif
title: "Automating Data Workflows with AWS Step Functions: An Example Using Fivetran and dbt"
date: 2023-01-06
highlight: monokai
author: Joseph Miocevich
image: 
tags: stepfunction aws fivetran lambda dbt
---


Automating and orchestrating data workflows can be a daunting task, but with the power of AWS Step Functions, it's easier than you might think! In this post, we'll show you how to use Step Functions to coordinate the execution of multiple AWS services and streamline your workflows with Fivetran connectors and dbt into Snowflake. 


> If you'd just like to get the solution I've created a repo on [Github](https://github.com/JMiocevich/demo-fivetran-stepfunction-orchestration) which you can reference and deploy yourself.

# Setting the Stage

Before we dive in, make sure you have the following:

- An AWS account
- Familiarity with Fivetran and dbt
- Snowflake Account

Solution Overview

To give you an idea of how everything fits together, here's a diagram of the solution architecture:

![architecture diagram](/img/step_functions_fivetran.png)

As you can see, the solution consists of:

- An Amazon Elastic Container Registry (ECR) repository for storing the Docker image for the ECS task
Three AWS Lambda functions:
- `getConnectorList`, which retrieves a list of connectors from Fivetran
- `syncFivetranConnectors`, which synchronizes a single Fivetran connector
- `fivetranWebook`, which is triggered by a webhook from Fivetran and starts a new execution of the state machine
- An AWS HttpApi endpoint for exposing the fivetranWebook function
- A DynamoDB table for storing [wait task token](https://docs.aws.amazon.com/step-functions/latest/dg/callback-task-sample-sqs.html) for the state machine
- An Amazon Elastic Container Service (ECS) cluster for running the ECS task
- An AWS Step Functions state machine for orchestrating the connectors and running the ECS task

# AWS Step Functions in Action

AWS Step Functions can be used to build a workflow that automates tasks in your system. In this particular solution, a state machine is defined in the statemachine.yml file and outlines the steps in the workflow. The state machine starts by calling a Lambda function called getConnectorList, which retrieves a list of connectors from  Fivetran and stores the result in the state machine's output.

Next, the state machine enters a "Sync All Connectors in group" state, which is a Map state that processes each connector in the list using an ItemProcessor state machine. This state machine starts by calling a Lambda function called syncFivetranConnectors, which synchronizes a single connector and sends a task token. The task token is stored in a DynamoDB table and the Sync Connectors state waits for the task token to be returned before proceeding. 

This allows the Sync All Connectors in group state to process each connector in parallel while still maintaining the correct order of execution. This token will be returned once fivetran succesfully finishes and sends a response to our webhook. When the webhook is triggered, it retrieves the corresponding token from dynamodb, and the returns this token to our stepfunction, allowing that step to complete.

After all connectors have been processed, state transitions to a "run DBT project" state, which invokes an ECS task that runs a dbt project to transform the data from the connectors. 

# Wrapping Up

In this post, we've shown you how to use AWS Step Functions to orchestrate Fivetran connectors and transform data using dbt. We've highlighted some of the key features of Step Functions, such as the Task and Map state types, the waitForTaskToken resource, and the ability to define inline state machines. We hope this has given you a better understanding of how Step Functions can help you automate complex workflows and coordinate the execution of multiple AWS services.

---

Don't be shy, [get in touch with us!](https://www.mechanicalrock.io/lets-get-started)

![Mechanical Rock Logo](/img/mr-logo-dark-landscape.jpg){:loading="lazy"}

> Header image by <a href="https://unsplash.com/@markusspiske?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Markus Spiske</a> on <a href="https://unsplash.com/s/photos/authentication?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>