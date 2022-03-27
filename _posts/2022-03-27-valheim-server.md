---
layout: post
title: Hosting a Valheim Server on AWS Part:1
date: 2022-03-08
tags: code cloudnative valheim deployment dedicated-server devops gaming software
author: Joseph Miocevich
image: img/valheim-logo.webp
description:
  How to setup a dedicated server for Valheim on AWS, with some discord notifications
---

![Header](/img/valheim-logo.webp)

Do you want to setup your own Valheim Server? Are you sick of waiting for your friend to figure out how to port foward their local server? Has your wallet been raided by an 'easy' online  game hosting solution? Then this is the blog post for you! Read on if you want to become a certified viking nerd, like myself fellow traveler.

Now, if you are like me, where I decide 9pm is when I should do that documentation Ive been procrastinating on, the hours that my friends play and I play rarley aligns, hence the need for a dedicated server. I’ve seen a few online tutorials on how to setup your own Valheim Server , but I took it as an opportunity to do what any semi self loathing programmer does.... ignore it all and decide I can do better....I mean attempt to do it myself as a learning opportunity.

We are gonna seperate this tutorial/educational rant into two parts. Part 1 will be the bare minimum to get a server up and running, whilst part 2 will include some fancier bells and whistles.

So lets cover some basic criteria on what creating your own virtual vikings adventure land will entail:

- Infrastructure as code using AWS SAM (minimal clicksops)
- Easy deployment for the technically challenged
- Secure and resilient architecture
- Cost competitive against out of the box services
- Cheap
- Ability to Auto stop server when game world is not in use
- Get Notifications on game state in discord (server start/stop/when player joins)
- Automatic Backup
- Did i mention cheap?

Part 2:
- Ability to send server commands through discord (start/stop/ban players)
- Edit server settings through discord

For some other resources I have encountered during my travels and my expereince with them, see below:

| The Thing                                                                                                                                           | My thoughts                                                                                                                                                                                                                                                                                       |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [ lloesche valheim-server docker ](https://github.com/lloesche/valheim-server-docker)                                                                 | Awesome repo, this setup takes large advantage on the great work done my lloesche!                                                                                                                                                                                                                     |
| [ How to host a dedicated Valheim server on  Amazon Lightsail ](https://aws.amazon.com/getting-started/hands-on/valheim-on-aws/)                      | Tried it, didnt work, costs too much. Be careful if you try this, lightsail assigns a  Elastic IP address even if you delete the lightsail instance. This leaves a unassigned IP on your account $$$. Had to remove via cli as it wasnt clear that this happened or how to remove it in lightsail interface |
| [ Valheim with terraform ](https://github.com/wahlfeld/valheim-on-aws)                                                                               | I dont know terraform, but looked good, would use it as a resource if you wanted to go down this path                                                                                                                                                                                             |
| [ Valheim server with awsCDK ](https://briancaffey.github.io/2021/03/18/on-demand-dedicated-serverless-valheim-server-with-cdk-discrod-interactions/) | Similar to what I want to do, but using CDK, provided some inspiration on how to use discord                                                                                                                                                                                                      |
| [ Valheim on AWS (Sam template) ](https://github.com/pwmcintyre/valheim-aws)                                                                          | A great repo, lots of very useful snippits, partculary on using s3 on hydrating/dehdrating the world on startup and shutdown, however has some code practises I did not like and has not been updated in a while with some commands not working as expected out of the box.                                                                                                         |

***
<br/>
## Instructions on setting up
Note that this tutorial was setup on a mac, minor changes for windows or linux will be neccsary

The following assumptions are been made.
- Basic understanding of nodeJS
- Access to AWS account with access credentials avaliable for use,  [AWS Docs](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)
- [VsCode](https://code.visualstudio.com) installed
- [NodeJs](https://nodejs.org/en/download/) installed
- [AWS Command Line Interface](https://aws.amazon.com/cli/) installed
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) installed
- Following github repo downloaded [Valheim Server](https://github.com/JMiocevich/valheim_server_aws_ts)
- [Discord WebHook](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks)





<br/>
## Discussion and Reasoning

### Why Fargate?
Takes advantage of [valheim-server docker](https://github.com/lloesche/valheim-server-docker), allows for simple deployment without having to manage servers.

### Why? 
Good Question.

### Why spot Instance?
Its a game and is not a critical workload, and so far have not found it to be any problem in availability. Also $$$.

### Why no static IP?
If the game is set to public: true, the server can be searched for using the in game server browser. Save some $$$.

### Secret Manager, but why?
Good practise, Lord Meyers will sense a disturbance in the code...be afraid.


### Cost. 
[https://aws.amazon.com/fargate/pricing/](https://aws.amazon.com/fargate/pricing/) \
[https://aws.amazon.com/s3/pricing/](https://aws.amazon.com/s3/pricing/) 


At time of writing with 24 hour usage: \
$0.118 per hour spot instance at time of writing \
$2.84 per day spot instance at time of writing \
~$80 per month 

However this is with 24 hour usage, with auto scale down this cost reduces significantly, and you only pay for what you use.

***
Now that you are a certfied viking nerd, [click here](https://www.youtube.com/watch?v=xvFZjo5PgG0) to redeem your official certification! Have fun playing Valheim. Enjoy your stay!

![](/img/valheim-image2.webp)


Until next time!
---

If you have questions, dont... or buy me a coffee first.


![Mechanical Rock Logo](/img/mr-logo-dark-landscape.jpg)
