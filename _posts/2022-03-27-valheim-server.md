---
layout: post
title: Valheim Server
date: 2022-03-27
tags: valheim dedicated server hosting fargate
author: Joseph Miocevich
image: img/valheim-logo.webp
description:
Do you want to die by falling tree and pay for the world it happens in! This is the blog for you
---

![Header](/img/valheim-logo.webp)

Valheim blew my expectations out of the water. It’s a third person viking action, survival adventure game in a procedurally generated world. Its like if you took the best aspects of of Skyrim, Minecraft and the visual style of Runescape but throw some sweet RTX on it, and then add some add Breath of the wild with some cooperative multiplayer......its a miracle of a game.

---

Now, if you're are like me, where I decide 9pm is when I should do that documentation Ive been procrastinating on, the hours that my friends play and I play rarley aligns, hence the need for a dedicated server. I’ve seen a few online tutorials on how to setup your own Valheim Server, but I took it as an opportunity to do what any semi self loathing programmer does.... ignore it all and decide I can do better....I mean attempt to do it myself as a learning opportunity.

So lets cover the acceptance criteria on what a creating your own virtual vikings adventure land will be entail:

- Infrastructure as code using AWS SAM (minimal clicksops)
- Easy deployment for the technically challenged
- Secure and resilient architecture
- Cost competitive against out of the box services
- Cheap
- Ability to Auto stop server when game world is not in use
- Ability to Start the server on demand using discord commands
- Get Notifications on game state (server start/stop, player count, when player joins or leaves world)
- Edit server settings through discord ???? maybe a part 2.
- Automatic Backup
- Did i mention cheap?

For some other resources I have encountered during my travels and my expereince with them, see below:

---


‘Lets list out some requirments for you too get started

- AWS CLI
- node.js

We are gonna seperate this tutorial/ educational rant into two parts, the bare minimum to get a server up and running, with the ability to start and stop the server from your command line and some basic discord notifications. Part two we will go into further how to setup a serverless discord bot with authenticated commands with the bells and whistles.

## Discussion and Reasoning

### Why Fargate?

Takes advantage of [valheim-server docker](https://github.com/lloesche/valheim-server-docker), allows for simple deployment without having to manage servers.

### Why?

Good Question, 42?

### Why spot Instance?

It’s a game and is not a critical workload, and so far have not found it to be any problem in availability. Also $$$

### Why no static IP?

If the game is set to public: true, the server can be searched for using the in game server browser. Save some $$$

### Secret Manager, but why?

Good practise, Lord Meyers will sense a disturbance in the code...

### Cost.

[https://aws.amazon.com/fargate/pricing/](https://aws.amazon.com/fargate/pricing/) \
[https://aws.amazon.com/s3/pricing/](https://aws.amazon.com/s3/pricing/)  \

At time of writing with 24 hour usage: \
$0.118 per hour spot instance at time of writing \
$2.84 per day spot instance at time of writing \
~$80 per month

However this is with 24 hour usage, with auto scale down this cost reduces significantly, and you only pay for what you use.

## How to Use

- Download some Visual Studio Code
- Install typescript
- Install AWS CLI
- Install the required packages
- Edit the config section with your things
- run ./ci/scripts/deploy.sh

Retrieve IP address

Login to server

Enjoy the dying by mosquitos 

TODO

Redo lambas - done

Implement Cloudwatch Alarm into the metric -done