---
layout: post
title: Fivetran Slack Notifications
date: 2022-06-09
tags: fivetran slack notifications incident-management webhook 
author: Joseph Miocevich
image: img/fivetran_logo.png
description:
  Creating fivetran event notifications using webhooks
---

![Fivetran Slack Notifications](/img/fivetranslacklambdalogo.png)

<br/>

Getting timley notifications on whether a Fivetran data connector is broken, or a dbt transformation has failed, is crucial to maintaining confidence in your datapipeline and reducing your time to restore. This blog will cover how to build your own system in AWS utilising Fivetran's newly released [webhooks](https://fivetran.com/docs/rest-api/webhooks) functionality and [slack webhooks](https://slack.com/intl/en-au/help/articles/115005265063-Incoming-webhooks-for-Slack).
<br>
## Overview

Fivetran's new webhook functionality allows you to subscribe to fivetran events, and push these to a webhook listener. Currently as this feature is still in beta, there is no way to directly connect this to slack or a incident management system, to resolve this we will be creating our own serverless webhook listener.
<br>
## Getting Started
<br>
### Creating a SlackApp

Setting up a slackapp for incoming [webhooks](https://api.slack.com/messaging/webhooks)

1. Create New App
2. Go to Features/IncomingWebhooks
3. Add New WebHook to workspace, select with channel
4. Keep your webhook URL for later to save into secrets manager 

![](/img/slack_webhook_sc1.png)

<br>
### Creating a Serverless Webhook Listener

1. Clone the [Fivetran-Slack-Notifications](https://github.com/JMiocevich/Fivetran-Slack-Notifications) repo
2. Deploy into your aws account using ```./ci/scripts/deploy.sh```, see [ReadMe](https://github.com/JMiocevich/Fivetran-Slack-Notifications#readme)
3. Save the slackWebhook URL in ```SlackApiSecret``` in secret manager
4. Generate a random set of characters for fivetran signing verification and save to ```FiveTranSigningKeySecret``` in secret manager, see Fivetran's [documentation](https://fivetran.com/docs/rest-api/webhooks#signing) on payload signing

### Creating FiveTran Webhook

Currently, webhooks can only be created using the Fivetran API, for moreinfomation on Fivetran webhooks, see [documentation](https://fivetran.com/docs/rest-api/webhooks#createwebhooks)


In PostMan set URL to 

```javascript
POST https://api.fivetran.com/v1/webhooks/account
```

Set Authorisation to Basic Basic Auth 
API keys from fivetran
```javascript
username = APIKey
password = API Key Secret
```
<br>
Make sure to copy in your ```your_aws_api_gateway_endpoint``` and ```FiveTranSigningKeySecret``` from before.

**Payload body:**
```javascript
{
  "url": "your_aws_api_gateway_endpoint",
  "events": [
    "sync_end",
    "dbt_run_failed"
  ],
  "active": true,
  "secret": "FiveTranSigningKeySecret"
}
```
![](/img/fivetran_postman_sc_1.png)

<br>
**Expected response should be**
```javascript
{
    "id": "connectorId",
    "type": "account",
    "url": "your_aws_api_gateway_endpoint",
    "events": [
        "sync_end",
        "dbt_run_failed"
    ],
    "active": true,
    "secret": "******",
    "created_at": "2022-06-09T08:24:32.537Z",
    "created_by": "some_value"
}
```

<br>

When a Fivetran sync ends in failure, or a dbt trasnformations fails, Fivetran will post to our webhook, which then in turn will send a message to our slack webhook.

<br>
<img src="/img/slack_fivetranmessage.png" alt="drawing" width="400"/>
<br>
**Example Payloads:**

**syncEnd**
```javascript
{
      event: 'sync_end',
      created: '2021-08-18T11:38:34.386Z',
      connector_type: 'asana',
      connector_id: 'some_id',
      destination_group_id: 'some_id',
      data: {
        status: 'FAILURE'
      }
}
```

**dbt_run_failed**
```javascript
{
      event: 'dbt_run_failed',
      created: '2022-06-01T07:41:30.389Z',
      destination_group_id: 'some_id',
      data: {
        result: {
          description: 'Steps: successful 0, failed 1',
          stepResults: [
            {
              step: {
                name: 'run dbt',
                command: 'dbt run'
              },
              endTime: '2022-06-01T07:41:26.478Z',
              success: false,
              startTime: '2022-06-01T07:41:08.979Z',
              commandResult: {
                error: '',
                output: "dbt Run failed: placeholder text",
                exitCode: 1
              },
              failedModelRuns: 3,
              successfulModelRuns: 0
            }
          ]
        },
        endTime: '2022-06-01T07:41:28.949Z',
        dbtJobId: 'some_id',
        startTime: '2022-06-01T07:40:38.917Z',
        dbtJobName: 'at8_30',
        startupDetails: {
          type: 'manual',
          userId: 'some_id'
        }
      }
    }
```



<br>

### **Examples**



[https://github.com/JMiocevich/Fivetran-Slack-Notifications](https://github.com/JMiocevich/Fivetran-Slack-Notifications)
<br/>

***

<br/>

### **References**
[https://fivetran.com/docs/functions/aws-lambda/sample-functions](https://fivetran.com/docs/functions/aws-lambda/sample-functions)

[https://fivetran.com/docs/rest-api/webhooks](https://fivetran.com/docs/rest-api/webhooks)

<br>
If you have any questions or need assistance setting up your own notification system, feel free to [get in touch](https://www.mechanicalrock.io/lets-get-started/)