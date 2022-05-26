---
layout: post
title: FiveTran Paginated Custom Connector
date: 2022-05-22
tags: fivetran custom connector custom-connector pagination getmore state
author: Joseph Miocevich
image: img/fivetran_logo.png
description:
  How to set up a custom fivetran connector with pagination
---

![Header](/img/fivetran_logo.png)

<br/>

## Overview

In simple terms, a FiveTran custom connector a cloud hosted function that can be setup on a cloud platform of your choice, which allows you to load data into FiveTran with a API FiveTran does not natively support. The benefits of this is that these connectors will have the same capabilities of standard connectors

- Incremental updates
- Source data type inference
- Automatic schema updates
- Data de-deduplication
- Destination ingestion optimisations
- Logs and alerts to monitor events and troubleshoot issues

Use FiveTran's Function connectors if:

- Fivetran doesn't have a connector for your source
- You are using private APIs or custom applications
- You are using a source or API that Fivetran is unlikely to support in the near future
- You want to sync unsupported file formats that require pre-processing
- You have sensitive data that needs filtering or anonymizing before entering the destination

*Fivetran* . Fivetran Custom Connector. (n.d.). Retrieved May 26, 2022, from https://fivetran.com/docs/functions 

## How to build a FiveTran connector:

## General Principles

**State Management**

State in a JSON object that contains cursors from the previous successful FiveTran executions run.

[https://fivetran.com/docs/functions/faq/use-state-object](https://fivetran.com/docs/functions/faq/use-state-object)

**FiveTran Pagination**

FiveTran pagination allows your lambda function to specify if there is more data to be collected, this is achieved using the hasMore boolean return.

If has more is true, the FiveTran return object is returned ,state is updated, however FiveTran immediately calls the lambda with the updated state. This will keep occurring until hasMore = False, which then resets FiveTran to its default state.

[https://fivetran.com/docs/functions/faq/use-hasmore-flag](https://fivetran.com/docs/functions/faq/use-hasmore-flag)

Example Expected function payload

```
{
      state: {
        cursor: '2020-01-01',
        paginationCounter: 0
      },
      secrets: Object
    }
```

Example Expected Connector response format

```
state: {
cursor: cursorPoint,
paginationCounter: 1
    },
    insert: {
      Table: apiResponseJson
    },
    schema: {
      Table: {
        primary_key: ['some_unique_key']
      }
    },
    hasMore: boolean
  }
}

```

<br/>

***

<br/>
## Table of fiveTran calls with response over a paginated query and multiple syncs.

For the sake of this example and readability, the return JSON from the api call will be summarised as *apiJsonResponse*

### Call 1: Intial Sync


**FiveTranCall**

```
state: {}
```

**Custom Connector Response**

```
{
state: {
lastUpdate: ''
paginationCounter: 1
},
insert: {
apiJsonResponseTable: *apiJsonResponse*
},
schema: {
apiJsonResponseTable: {
primary_key: ['id']
}
},
hasMore: True
}
```

Initial API sync with no state, api call is getting all data with no state and has returned a paginated response

Key response features
State: 
- No LastUpdate as paginated query has not been completed
- Pagination Counter incremented + 1
- hasMore = True

<br/>
### Call 2: Paginated Query 1

**FiveTranCall**

```
state: {
lastUpdate: '',
paginationCounter: 1
}
```

**Custom Connector Response**

```
{
state: {
lastUpdate: '',
paginationCounter: 2
},
insert: {
apiJsonResponseTable: *apiJsonResponse*
},
schema: {
apiJsonResponseTable: {
primary_key: ['id']
}
},
hasMore: True
}
```

Paginating through the api response for initial sync

Key response features
State: 
- No LastUpdate as paginated query has not been completed
- Pagination Counter incremented + 1
- hasMore = True

<br/>
### Call 3: Paginated Query 2

**FiveTranCall**

```
state: {
lastUpdate: '',
paginationCounter: 2
}
```

**Custom Connector Response**

```
{
state: {
lastUpdate: '2020-01-01',
paginationCounter: 0
},
insert: {
apiJsonResponseTable: *apiJsonResponse*
},
schema: {
apiJsonResponseTable: {
primary_key: ['id']
}
},
hasMore: False
}
```

Paginating through the api response for initial sync

Key response features
State: 
- LastUpdate Set as paginated query has been completed
- Pagination Counter set to 0, as paginated query is completed
- hasMore = false

<br/>
### Call 4: Next FiveTran Sync

**FiveTranCall**

```
state: {
lastUpdate: '2020-01-01',
paginationCounter: 0
}
```

**Custom Connector Response**

```
{
state: {
lastUpdate: '2020-01-02',
paginationCounter: 0
},
insert: {
apiJsonResponseTable: *apiJsonResponse*
},
schema: {
apiJsonResponseTable: {
primary_key: ['id']
}
},
hasMore: False
}
```

FiveTran Sync with LastUpdate State

Key response features
State: 
- LastUpdate updated, query has been completed
- Pagination Counter set to 0, as no pagination necessary 
- hasMore = false

<br/>
### Call 5: Next FiveTran Sync

**FiveTranCall**

```
state: {
lastUpdate: '2020-01-02',
paginationCounter: 0
}
```

**Custom Connector Response**

```

state: {
lastUpdate: '2020-01-03',
paginationCounter: 0
},
insert: {
apiJsonResponseTable: *apiJsonResponse*
},
schema: {
apiJsonResponseTable: {
primary_key: ['id']
}
},
hasMore: False
})
}
```

FiveTran Sync with LastUpdate State

Key response features
State: 

- LastUpdate updated, query has been completed
- Pagination Counter set to 0, as no pagination necessary 
- hasMore = false

<br/>

***

<br/>



### **Guardrails to consider**

- Lambda timeouts and payload limit
- Ensure calls to the Lambda are **idempotent** for a given FiveTran cursor
- Be wary or avoid using cursors supplied by the pagination of an upstream API that may not be persistent.

### **References**

[https://fivetran.com/docs/functions](https://fivetran.com/docs/functions)