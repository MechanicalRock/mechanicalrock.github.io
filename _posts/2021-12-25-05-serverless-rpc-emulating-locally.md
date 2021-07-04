---
layout: post
title: Building a Serverless RPC API on AWS: Emulating Locally & Testing
date: 2021-12-25
tags: rpc go twirp aws middleware
author: Matt Tyler
image: img/twirp.png
---

<center><img src="/img/twirp.png" /></center>
<br/>

# Getting Ready

You will need to perform the following prerequisites, in addition to those in a preceding article.

1. Install Docker.

  You can follow the instructions [here](https://docs.docker.com/get-docker/) to get Docker for your particular OS.

2. Pull the DynamoDB local container. This will let you interact with a local instance of a database that is API-compatible with DynamoDB.

`docker pull amazon/dynamodb-local`

3. Install the NoSQL Workbench for DynamoDB. Instructions [here](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/workbench.settingup.html).

This isn't strictly necessary but we are going to use it to build up some intuition via ClickOps before we perform some test automation.

# Invoke using SAM Local

First we need to start up the DynamoDB local container.

```bash
docker run -p 8000:8000 amazon/dynamodb-local
```

Then we can open up the workbench - which should look like the following.

Then you need to;

- Click on operation builder & click to add 'New Connection'

- Enter the following details

After selecting the connect, it will open this pane up. Note that we do not have any tables yet. We need to rectify this.

- Click `Data Modeler` and add new data model - `Ledger`
- Click to add a new table - which we will call `Ledger`.
- Ensure the `Ledger` table has a partition key of type `string` and name `pk`, as well as sort of type `string` and name `sk`.
- Click `Visualizer` and then click `commit`. You will need to select the `LedgerDB` connection we set-up earlier.
- Click back to `Operation Builder` and you will now see that we have a table called `Ledger` available.
- Note the credentials down for the connection as well.

We then need to configure our profile; add the following to `~/.aws/credentials` (substituting the credentials you received, of course).
```
[local]
aws_access_key_id=<whatever-your-access-key-id-was>
aws_secret_access_key=<whatever-your-secret-access-key-was>
```

Then create a new profile in `~/.aws/config`.

```
[profile local]
region=localhost
output=json
```

Once this is done we can start looking at how to invoke our application using SAM.

First we need a file that we can use to override the environment variables that our function uses. I created the following file;

```json
{
  "Backend": {
    "TABLE_NAME": "Ledger",
    "DDB_ENDPOINT": "http://host.docker.internal:8000"
  }
}
```

This ensures we can target the ledger table that is being exposed via the DynamoDB local container.

We will also need to invoke the function using an event - so I will create the following file which represents the payload that we would send to API Gateway.

```json
{
	"Root": "example.com",
	"Subdomain": "myapp"
}
```

Next we need to start up the gateway. Use the following command to do so. The first time you do this, it may take a little while for SAm to build the emulation container for API Gateway.

```
sam local start-api --profile local \
	--port 8080 \
	--env-vars ./local/env.json \
	--warm-containers EAGER
```

Once it starts, you will be able to send requests to it.

```
> curl -H "Content-Type: application/json" -d @./local/event.json http://localhost:8080/twirp/ledger.Ledger/ClaimDomain
> {"Domain":{"Root":"example.com","Subdomain":"myapp"}}% 
```

The table should have the result in it...

Cool! So taking stock we were able to -

1. Get DynamoDB local running,
2. Start our API up locally with our lambda code,
3. Send an event to the API, and,
4. Have our custom code connect to the local database to perform it's function.

OK - but most of us aren't going to test our code like that, right? It would be a lot better if we had some sort of test program that we could execute against some API endpoint, that way it would work on our local instance, or something running in the cloud. So let's try and do that now!

