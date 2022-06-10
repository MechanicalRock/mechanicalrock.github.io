---
layout: post
title: Fivetran Slack Notifications
date: 2022-06-09
tags: fivetran slack notifications incident-management webhook 
author: Joseph Miocevich
image: /img/fivetranslacklambdalogo.png
description:
  Creating fivetran event notifications using webhooks
---

![Fivetran Slack Notifications](/img/fivetranslacklambdalogo.png)

<br/>


Getting timley notifications on whether a Fivetran data connector is broken, or a [dbt transformation](https://fivetran.com/docs/transformations/dbt) has failed, is crucial to maintaining confidence in your datapipeline and reducing your time to restore. This blog will cover how to build your own system in AWS utilising Fivetran's newly released [webhooks](https://fivetran.com/docs/rest-api/webhooks) functionality and [slack webhooks](https://slack.com/intl/en-au/help/articles/115005265063-Incoming-webhooks-for-Slack).

***
<br>
## Overview

Fivetran's new webhook functionality allows you to subscribe to Fivetran events, and push these to a webhook listener. Currently, as this feature is still in beta, there is no way to directly connect to slack or an incident management system, to resolve this we will be creating our own serverless webhook listener, which will link to a slack channel.


Fivetran supports the follwing events for webhooks, see [documentation](https://fivetran.com/docs/logs#events) for more infomation.

>
- sync_start
- sync_end
- status (deprecated)
- dbt_run_start
- dbt_run_succeeded
- dbt_run_failed
- transformation_run_start
- transformation_run_succeeded
- transformation_run_failed

*Fivetran* . Fivetran Custom Connector. (n.d.). Retrieved June 10, 2022, from https://fivetran.com/docs/logs#events 

We are only interested in getting notified on failures, so we will only be subscribing to ```sync_end``` and ```dbt_run_failed``` events.



**Architecture Diagram**
![Architecture diagram](/img/fivetranwebhook_architecture.png)

***
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

#### Discussion 

Fivetran uses [SHA-256 HMAC algorithm](https://en.wikipedia.org/wiki/HMAC) to sign the webhook payload using a a specified secret(```FiveTranSigningKeySecret```). This signature is calculated based on the payload body. To verify the signature, we generate our own signature to verify that the payload is from Fivetran and that the payload body is unmodified.
The signature is located in the payload header as ```event.headers['X-Fivetran-Signature-256']```, we then use the [crypto.timingSafeEqual](https://nodejs.org/api/crypto.html#cryptotimingsafeequala-b) function to prevent [timing attacks](https://en.wikipedia.org/wiki/Timing_attack) and verifiy the signature. 

```javascript
import * as crypto from 'crypto'

const generated_key = signKey(fiveTranSigningKey, event.body)

fiveTranSigningVerification(generated_key, event.headers['X-Fivetran-Signature-256'])

function fiveTranSigningVerification(generatedKey: string, fiveTranKey: string) {
  if (crypto.timingSafeEqual(Buffer.from(generatedKey), Buffer.from(fiveTranKey))) {
    console.log('Valid Signature')
  } else throw new Error(`Invalid Signature`)
}
```

<br>

### Creating FiveTran Webhook

Currently, webhooks can only be created using the Fivetran API, for moreinfomation on Fivetran webhooks, see [documentation](https://fivetran.com/docs/rest-api/webhooks#createwebhooks)


In PostMan set URL to 

```javascript
POST https://api.fivetran.com/v1/webhooks/account
```

Set Authorisation to Basis Auth 
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
**Expected response:**
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

***

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