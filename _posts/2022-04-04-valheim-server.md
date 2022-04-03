---
layout: post
title: Hosting a Valheim Server on AWS Part:1
date: 2022-04-04
tags: code ecs fargate cloudnative valheim deployment dedicated-server devops gaming aws
author: Joseph Miocevich
image: img/valheim-logo.webp
description:
  How to set up a dedicated server for Valheim on AWS, with some discord notifications
---

![Header](/img/valheim-logo.webp)

Do you want to set up your own Valheim Server? Are you sick of waiting for your friend to figure out how to port forward their local server? Has your wallet been raided by an 'easy' online game hosting solution? Then this is the blog post for you! Read on if you want to become a certified Viking nerd.

Now, if you are like me, where I decide 9 pm is when I should do that documentation I've been procrastinating on, the hours that my friends play and I play rarely aligns, hence the need for a dedicated server. I’ve seen a few online tutorials on how to set up your own Valheim Server, but I took it as an opportunity to do what any semi self-loathing programmer does.... ignore it all and decide I can do better...I mean attempt to do it myself as a learning opportunity.

If you just want the code, here you go: [ Valheim-Server-on-AWS-Part-1 ](https://github.com/JMiocevich/Valheim-Server-on-AWS-Part-1)

We are gonna separate this post into two parts. Part 1 will be the bare minimum to get a server up and running, whilst part 2 will include some fancier bells and whistles.

So let's cover some basic criteria on what creating your own virtual Vikings adventure land will entail:

- Infrastructure as code using AWS SAM (minimal clicksops)
- Easy deployment for the technically challenged
- Secure and resilient architecture
- Cost competitive against out of the box services
- Cheap
- Ability to Auto stop server when game world is not in use
- Get Notifications on the game state in discord (server start/stop/when a player joins)
- Automatic Backup
- Did I mention cheap?

Part 2:
- Ability to send server commands through discord (start/stop/ban players)
- Edit server settings through discord
- Automatic IP address retrieval through discord

***
<br/>
## Instructions

The following/requirements are needed.
- Basic understanding of nodeJS
- Access to AWS account with access credentials avaliable for use,  [AWS Docs](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)
- [Visual Studio Code](https://code.visualstudio.com) installed
- [Node.js](https://nodejs.org/en/download/) installed
- [AWS Command Line Interface](https://aws.amazon.com/cli/) installed
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) installed
- Following github repo downloaded [Valheim Server](https://github.com/JMiocevich/valheim_server_aws_ts)
- [Discord WebHook](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks)

See [ setup instructions ](https://github.com/JMiocevich/Valheim-Server-on-AWS-Part-1/blob/main/README.md) for step by step instructions on setup.

## Discussion and Reasoning

### Why Fargate?
Takes advantage of [valheim-server docker](ht
tps://github.com/lloesche/valheim-server-docker), allows for simple deployment without having to manage servers.

### Why spot Instance?
It's a game and is not a critical workload, and so far have not found it to be any problem in availability. Also $$$.

### Why Lambda Functions for server start/stop
In future, a discord command/HTTP endpoint will be implemented to invoke this lambda, allowing for an easy server start, currently, it needs to be invoked manually via the CLI or console. The stop function allows for cloud watch to trigger an SNS topic, which in turn invokes the lambda stop function.


### Why discord notification?
Allows for easy monitoring of Server Status and a player connects to the server.

![Valheim Discord Notifications](/img/valheim_discord.png)
<br/>

Instructions on how to do this are in the [ lloesche valheim-server](https://github.com/lloesche/valheim-server-docker) repo.

<br/>

### For the Cloudwatch Alarm, why use CPU Usage as a metric to track server usage?
Ideally, I would like to parse the logs/ or ping the server for player count, however, I was having trouble getting it to work reliably. In addition, this ensures that the server will not shut down if an update or backup is been actioned. 

### Why no static IP?
If the game is set to public: true, the server can be searched for using the game server browser. Save some $$$.

### Secret Manager, but why?
Good practise, Lord Myerscough will sense a disturbance in the code...be afraid.


### Cost. 
[https://aws.amazon.com/fargate/pricing/](https://aws.amazon.com/fargate/pricing/) \
[https://aws.amazon.com/s3/pricing/](https://aws.amazon.com/s3/pricing/) 


At the time of writing with 24-hour usage: \
$0.118 per hour spot instance at the time of writing \
$2.84 per day spot instance at the time of writing \
~$80 per month 

However this is with 24-hour usage, with auto-scale down this cost reduces significantly, and you only pay for what you use. The cloud watch alarm is set to alarm if CPU usage drops below a threshold of 25/30 with a period of 60 seconds.
This allows for CPU spikes typically performed during a server update of backup without retriggering the waiting period for server shutdown.


This alarm triggers an SNS topic, registered to the Server Stop lambda function
<br/>

***

<br/>
Now that you are a certified Viking nerd, [click here](https://www.youtube.com/watch?v=xvFZjo5PgG0) to redeem your official certification! Have fun playing Valheim. Enjoy your stay!

![](/img/valheim-image2.webp)


Until next time!
---

If you have questions, feel free to [reach out](contact@mechanicalrock.io), or dont... or buy me a coffee, I fully condone bribery by food.



***
<br/>
## References

| The Thing                                                                                                                                           | My thoughts                                                                                                                                                                                                                                                                                       |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [ lloesche valheim-server docker ](https://github.com/lloesche/valheim-server-docker)                                                                 | Awesome repo, this setup takes large advantage on the great work done my lloesche!                                                                                                                                                                                                                     |
| [ How to host a dedicated Valheim server on  Amazon Lightsail ](https://aws.amazon.com/getting-started/hands-on/valheim-on-aws/)                      | Tried it, didn't work, costs too much. Be careful if you try this, lightsail assigns an Elastic IP address even if you delete the lightsail instance. This leaves an unassigned IP on your account $$$. Had to remove it via CLI as it wasn't clear that this happened or how to remove it in lightsail interface |
| [ Valheim with terraform ](https://github.com/wahlfeld/valheim-on-aws)                                                                               | I don't know terraform, but looked good, would use it as a resource if you wanted to go down this path                                                                                                                                                                                             |
| [ Valheim server with awsCDK ](https://briancaffey.github.io/2021/03/18/on-demand-dedicated-serverless-valheim-server-with-cdk-discrod-interactions/) | Similar to what I want to do, but using CDK, provided some inspiration on how to use discord                                                                                                                                                                                                      |
| [ Valheim on AWS (Sam template) ](https://github.com/pwmcintyre/valheim-aws)                                                                          | A great repo, lots of very useful snippets, particularly on using s3 on hydrating/dehydrating the world on startup and shutdown, however, has some code practises I did not like and has not been updated in a while with some commands not working as expected out of the box.                                                                                                         |
