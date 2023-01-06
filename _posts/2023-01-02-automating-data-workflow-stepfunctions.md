---
layout: post
font: serif
title: "Automating Data Workflows with AWS Step Functions: An Example Using Fivetran and dbt"
date: 2023-01-06
highlight: monokai
author: Joseph Miocevich
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

AWS Step Functions can be used to build a workflow that automates tasks in your system. In this particular solution, a state machine is defined in the statemachine.yml file and outlines the steps in the workflow. The state machine starts by calling a Lambda function called getConnectorList, which retrieves a list of connectors from  Fivetran using the [list connectors in group](https://developers.fivetran.com/openapi/reference/v1/operation/list_all_connectors_in_group/) Fivetran api call.

```python
url = "https://api.fivetran.com/v1/groups/" + group_id + "/connectors"

headers = {"Accept": "application/json"}

response = requests.get(url, headers=headers, auth=(FivetranKey,FivetranSecret))

data = response.json()
print(data)
print(data['data']['items'])

connectors_list=[]
for x in data['data']['items']:
    connectors_list.append(x['id'])

json_return= {
    'group_id': group_id,
    'connectors_list': connectors_list
}
```

The output of getConnectorList to the StepFunction output is as follows:

```python
    {
        'group_id': 'iii_outgrow', 
        'connectors_list': ['purr_rich', 'replica_rarest']
    }
```


Next, the state machine enters a "Sync All Connectors in group" state, which is a Map state that processes each connector in the above `connectors_list`. This state machine then iterates the connector name by calling a Lambda function called syncFivetranConnectors, which synchronizes a single connector and addtionally sends a task token. The task token is stored in a DynamoDB table and the Sync Connectors state waits for the task token to be returned before proceeding to the next stage. 

```python
def lambda_handler(event, context):
    
    connector_id = event['connectors_id']
    token= event['MyTaskToken']

    syncFivetranConnector(connector_id)
    storeToken(connector_id,token)


def syncFivetranConnector(connector_id):
    FivetranKey=get_secret('FivetranKey')
    FivetranSecret=get_secret('FivetranSecret')

    url = "https://api.fivetran.com/v1/connectors/" + connector_id + "/sync"

    headers = {"Accept": "application/json"}

    response = requests.post(url, headers=headers, auth=(FivetranKey,FivetranSecret))

    data = response.json()
    print(data)

def storeToken(connector_id,token):
    client = boto3.resource('dynamodb')
    table = client.Table("stateTokenTable")
    print(table.table_status)

    table.put_item(Item= {'id': connector_id,'MyTaskToken': token})
```
<br/>
> Each lambda in the interation must receive a token response before proceeding. The step function state will remain in progress until the wait token is returned.

<br/>
We can see this logical step progression using the StepFunctions visual editor:
![step_function_visual_editor diagram](/img/step_function_visual_editor.png)

<br/>

The `Sync All Connectors in group` state processes each connector in parallel while still maintaining the correct order of execution. This token will be returned once fivetran succesfully finishes and sends a response to our webhook. When the webhook is triggered, it retrieves the corresponding token from dynamodb, and the returns this token to our stepfunction, allowing that step to complete. This can be seen in the following code from `fivetranWebook` function:

```python
connector_id = body['connector_id']
status=body['data']['status']

# Get the wait token from the dynamoDB table using connection_id
token = getWaitToken(connector_id)

# Condtional Logic to send success or failure to step function
client_stepfunction = boto3.client('stepfunctions')

if status == 'SUCCESSFUL':
    client_stepfunction.send_task_success(taskToken=token,output='{}')
    print('success')

else:
    print('failure')
    client_stepfunction.send_task_failure(taskToken=token)
```

After all connectors have been processed with a successful state, state transitions to a `run DBT project` state, which invokes an ECS Fargate task that runs a dbt project in our specified database.

Below is the stepfunction output which we can use to monitor and diagnose any issues that may arise.

![table diagram](/img/step_function_table.png)
<!-- ![graph diagram](/img/step_function_graph.png) -->

# Wrapping Up

In this post, we've shown you how to use AWS Step Functions to orchestrate Fivetran connectors and transform data using dbt. We've highlighted some of the key features of Step Functions, such as the Task and Map state types, the waitForTaskToken resource, and the ability to define inline state machines. We hope this has given you a better understanding of how Step Functions can help you automate complex workflows and coordinate the execution of multiple AWS services.

---

Don't be shy, [get in touch with us!](https://www.mechanicalrock.io/lets-get-started)

![Mechanical Rock Logo](/img/mr-logo-dark-landscape.jpg){:loading="lazy"}

> Header image by <a href="https://unsplash.com/@markusspiske?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Markus Spiske</a> on <a href="https://unsplash.com/s/photos/authentication?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>