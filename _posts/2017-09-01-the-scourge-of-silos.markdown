---
layout: post
title:  "The Scourge of Silos"
date:   2017-09-01 04:48:58 +0000
categories: bdd tdd devops pairing mobbing
author: Hamish Tedeschi
image: img/silos.png
---
This is one of those articles that may stir up a bit of angst with people, because essentially it is an opinion piece. Not driven by data, merely driven by what I think works best. It was provoked by a brief conversation on social media and got me thinking about why I think the way I do. The conversation was based on the following post by [Josh Partogi](https://www.linkedin.com/in/jpartogi/), which was on the money:

```
Many are talking about devops these days.

* Some think devops is a tool.
* Others think it is a department or a job role.
* Others think it is about frequent deployment.
* While others think devops is bug fixing & development.

The IT industry must be the most confusing industry these days.
```

Running an Enterprise DevOps & Continuous Delivery consultancy, this is a subject close to my heart. We are an opinionated bunch at Mechanical Rock and we believe that if you do the Dev bit in DevOps right, then the Ops bit becomes a lot easier. Bear with me, I will explain and hopefully close the loop. The way I see it, DevOps is made up of 4 key tenets which give way to a set of practices, tooling or processes. 

1. Sharing / No Silos: Creating a culture where information is shared is vital to the success of DevOps, nothing should ever be "someone else's problem".
2. Culture: DevOps seeks to create a high-trust culture of collaboration through learning and experimentation. 
3. Measure Everything / Fast Feedback: improvements are based on experimentation, experimentation relies on accurate information and measurement. Short feedback loops generate more information, more quickly and allow informed decisions to be made.
4. Automate Everything: automate away the 'drudgery' in the the Development-Operations lifecycle, so people can focus on what they are best at - problem solving.

I'd like to focus on the first two tenets, as I think they relate heavily to the original post around the misunderstanding or more likely, the misuse (both intentionally and unintentionally) of "DevOps".

The rise of the DevOps movement has given us a lot of great tools, such as Docker, Ansible, Terraform etc which on their own can provide a level of benefit. Sure, we can give a guy or gal a tool like Ansible and say "Do your worst". They will go away and create a set of repeatable infrastructure as code, but very quickly, that infrastructure becomes their problem. They are the one responsible for it and hence if any problems occur or enhancements are needed, then it falls to their feet. I'd wager that this "resource" is probably called the DevOps engineer or lives in the DevOps team. This becomes a silo of knowledge, a single point of failure and at best 

Recently, I have seen first hand, at a major financial institution, the impact of having a "DevOps Team". The six scrum teams we worked with were developing using a gitflow model and although all the teams had the limitless scale of AWS on offer to them, they would develop on a feature branch, but not be able to continuously build, package, deploy and test the feature on that branch as the DevOps team hadn't set that up for them and were not part of their scrum teams. The scrum teams were forced to merge the changes to master and test large volumes of features together, thus increasing the risk of change, making the feedback loop larger and slowing the whole process down considerably.

Wouldn't it be a better situation that the team responsible for the application create the infrastructure required as they are building it, using those techniques? The knowledge stays within that team and the power to make positive change is in their own hands. 

So why do organisations create a DevOps Team, which sits in its own bubble and has its own reporting structure, which essentially just look after infrastructure (in my experience)? I think a lot of it comes down to organisational structure in matrix management style organisations. 

![Matrix Management Picture](/img/matrix.png)

The problem with matrix manangement is that fosters all sorts of problems. Political bullshit, being one. In this scenario, a team is a bunch of individuals from different parts of the organisation that are brought together to deliver something. In theory, this is great, but the problem is that line management for these indivduals sits off to one side. Any successes will be attributed to the members from that line manager and inversely any failures will be as a result of the other team members not aligning with that manager. The biggest problem as a result of this is the time to make decisions. It effectively widens the feedback loop (again) by involving intertested third parties and will disenfranchise the team actually doing the work.



