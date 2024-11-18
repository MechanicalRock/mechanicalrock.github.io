---
layout: postv2
title: "AppSync Events - Serverless WebSockets on AWS"
description: "Websockets used to be a nightmare, but no longer! Dive into the new AppSync Event API"
date: 2024-11-04
highlight: monokai
image: /img/appsync-events/appsync-header.png
author: Jesse Millman 
tags:
  [
    AppSync,
    Events,
    WebSockets,
  ]
---

Apps such as Figma have begun to make real-time UX expectations ubiquitous.
Now more than ever developers are looking for secure, scalable, and serverless
socket solutions.

Previously on AWS, if you wanted to do anything in real-time over sockets
the IoT service was their best serverless offering.
As counter-intuitive as it was using something built for physical devices for
the web, MQTT ultimately was a trivial overhead for the benefits it brought.
Yet we purists still pined over a web native WebSocket implementation,
and finally Amazon has delivered!

To keep things simple, lets dive into a common use-case for real-time: Social.

<br />

## Getting Started

> **Note**: as of publishing, CloudFormation had not been enabled for this service.
We'll do our best to remember & update, but for now - lets use the console.

1. Visit the AWS [AppSync Console](https://console.aws.amazon.com/appsync)
2. Create an API, ensuring you select the "Create Event API" option.
3. Give your API a name & click "Create"

<br />

## Publishing your first message

Thankfully, Amazon takes care of most of the boilerplate. Following the steps
above, you're instantly up and running with both an Endpoint, and an API
Key to authenticate with.

> **Note**: In production you definitely want stronger Auth, but for this demo
the API key will do!

Jump over to the **Pub/Sub** Editor, and punch in a test event:

```json
[
  { 
    "id": "0192ec69-3337-7d35-9b49-e63106332e87",
    "date": "just now",
    "author": "jesse millman",
    "content": "unreal blog post my guy, sockets are great!"
  }
]
```

Subscribe to the channel in the lower panel. Along with some of the subscription
confirmations you will see the following data event message come through:

```json
{
  "id": "f5a47f80-c721-4051-a68c-6caafc1cd44c",
  "event": "{\"id\":\"0192ec69-3337-7d35-9b49-e63106332e87\",\"date\":\"just now\",\"author\":\"jesse millman\",\"content\":\"unreal blog post my guy, sockets are great!\"}"
}
```

![AWS Dashboard](/img/appsync-events/screenshot-1.png)

<br />

## Wiring this up to your app

AWS recommends using their [Amplify library](https://github.com/aws-amplify/amplify-js),
but it's likely overkill. Fortunately it's just a standard WebSocket
endpoint, so you can connect with whatever you'd like. Here's an example using
the [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
to subscribe to all messages in the default namespace for the placeholder article:

```javascript
const REALTIME_DOMAIN = ''
const HTTP_DOMAIN = ''
const API_KEY = ''
const id = '0192ec6b-b12f-708f-8ea9-b1d48c993be2' // placeholder article id

const auth = { 'x-api-key': API_KEY, host: HTTP_DOMAIN }

function getAuthProtocol() {
  const header = btoa(JSON.stringify(auth))
    .replace(/\+/g, '-') // Convert '+' to '-'
    .replace(/\//g, '_') // Convert '/' to '_'
    .replace(/=+$/, '') // Remove padding `=`
  return `header-${header}`
}

const socket = await new Promise((resolve, reject) => {
  const socket = new WebSocket(
    `wss://${REALTIME_DOMAIN}/event/realtime`,
    ['aws-appsync-event-ws', getAuthProtocol()])
  socket.onopen = () => {
    socket.send(JSON.stringify({ type: 'connection_init' }))
    resolve(socket)
  }
  socket.onclose = (evt) => reject(new Error(evt.reason))
  socket.onmessage = (event) => console.log('=>', JSON.parse(event.data))
})

socket.send(JSON.stringify({
  type: 'subscribe',
  id: crypto.randomUUID(),
  channel: `/default/comments/${id}/*`,
  authorization: auth 
}))
```

To send a message, we can use the standard fetch API:

```javascript
const event = {
  "channel": `/default/comments/${id}`,
  "events": [
    JSON.stringify({message:'How good are Websockets?!'})
  ]
}

const response = await fetch(`https://${HTTP_DOMAIN}/event`, {
  method: 'POST',
  headers: auth,
  body: JSON.stringify(event)
})

console.log(response)
```

And it's truly that simple! We're now set up with scalable, serverless WebSocket infrastructure.

If you would like to play with an end-to-end demo, i have created a public
repository [here](https://github.com/jessemillman/demo-appsync-events)

<br />

---

<br />

From Sockets to CRDT's - if you want to chat about or get help with implementing
real-time services in your applications, please
[reach out!](https://www.mechanicalrock.io/lets-get-started)

![Mechanical Rock Logo](/img/mr-logo-dark-landscape.jpg)
