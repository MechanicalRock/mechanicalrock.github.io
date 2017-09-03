---
layout: post
title:  "The Scourge of Silos"
date:   2017-09-01 04:48:58 +0000
categories: bdd tdd devops pairing mobbing
author: Hamish Tedeschi
image: img/silos1.png
---
This is one of those articles that may stir up a bit of angst with people, because essentially it is an opinion piece. Not driven by data, merely driven by what I think works best. It was provoked by a brief conversation on social media and got me thinking about why I think the way I do. The conversation was based on the following post by [Josh Partogi](https://www.linkedin.com/in/jpartogi/), which was on the money:

> Many are talking about devops these days.
> 
> * Some think devops is a tool.
> * Others think it is a department or a job role.
> * Others think it is about frequent deployment.
> * While others think devops is bug fixing & development.
> 
> The IT industry must be the most confusing industry these days.

Running an Enterprise DevOps & Continuous Delivery consultancy, this is a subject close to my heart. We are an opinionated bunch at [Mechanical Rock](https://www.mechanicalrock.io/) and believe that if you do the dev bit in DevOps right, then the Ops bit becomes a lot easier. Bear with me, I will explain and hopefully close the loop. 

The way I see it, DevOps is made up of 4 key tenets which give way to a set of practices, tooling or processes. 

1. Sharing / No Silos: Creating a culture where information is shared is vital to the success of DevOps, nothing should ever be "someone else's problem".
2. Culture: DevOps seeks to create a high-trust culture of collaboration through learning and experimentation. 
3. Measure Everything / Fast Feedback: improvements are based on experimentation, experimentation relies on accurate information and measurement. Short feedback loops generate more information, more quickly and allow informed decisions to be made.
4. Automate Everything: automate away the 'drudgery' in the the Development-Operations lifecycle, so people can focus on what they are best at - problem solving.

I'd like to focus on the first two tenets, as I think they relate heavily to the intent of the original post and underline the misunderstanding or more likely, the misuse (both intentionally and unintentionally) of "DevOps".

The rise of the DevOps movement has given us a lot of great tools, such as Docker, Ansible, Terraform etc which on their own can provide a level of benefit. Sure, we can give a guy or gal a tool like Ansible and say "Do your worst". They will go away and create a set of repeatable infrastructure as code, but very quickly, that infrastructure becomes their problem. They are the ones responsible for it and hence if any problems occur or enhancements are needed, it falls to their feet. I'd wager that this "resource" is probably called the DevOps Engineer or lives in the DevOps team. This becomes a silo of knowledge, a single point of failure and at best an experiment which proved valuable, but then needs wider adoption.

Recently, I have seen first hand, at a major financial institution, the direct impact of having a "DevOps Team". The six scrum teams we worked with were developing using a gitflow model and although all the teams had the limitless scale of AWS on offer to them, none could actually use it. Some didn't even know the platform they were deploying their application to (which baffles me for a start, as how are they architecting it correctly?). They would develop on a feature branch, but not be able to continuously build, package, deploy and test that feature on the branch, as the DevOps team hadn't set that up for them and were not part of any of these scrum teams. The scrum teams were forced to merge the changes to `master` and test large volumes of features together towards the end of the sprint, thus increasing the risk of change, making the feedback loop larger and slowing the whole process down considerably.

Wouldn't it be a better situation that the team responsible for the application actually create the infrastructure required as they are building it, using those techniques? The knowledge stays within that team, the architecture is emergent and the power to make positive change is in their own hands. 

So why do organisations create a DevOps Team, which sits in its own bubble and has its own reporting structure, which essentially look after infrastructure, sometimes as code, in my experience? I think a lot of it comes down to organisational structure and command and control leadership styles. 

![Command and Control Management Picture](/img/commdandcontrol.png)

Command and control assumes a leader knows best and that they know where the organisation is going (goals, outcomes) and have a plan for how to get there (process). With a term as fuzzy as "DevOps", as illustrated by Josh's post, should we expect IT leaders in enterprise organisations, who have gone from Waterfall to Agile and now DevOps to be in touch enough to understand the nuance of it? Not in my experience. 

So enter matrix management, which was designed to solve all these problems, by creating product centric delivery teams, but still retaining line management.

![Matrix Management Picture](/img/matrix-man.png)

The problem with matrix manangement is that fosters all sorts of problems. Political bullshit, being one. In this scenario, a team of individuals from different parts of the organisation are brought together to deliver something. In theory, this is great, but the problem is that line management for these indivduals sits off to one side. Any successes will be attributed to the members of that line manager and inversely any failures will be as a result of the other team members not aligning with that manager. The biggest problem, as a result of this, is the time to make decisions. It effectively widens the feedback loop (again) by involving interested third parties and will disenfranchise the team actually doing the work.

The modern equivalent of matrix management in IT teams is the Spotify Model. Not that is actually a model. But expensive consultancies are paid loads to roll out a "model" which effectively propogates this shit. Guilds and tribes may have been formed with good intentions, but are just abused by the middle management that become the issue. 

It takes an exceptional leader or rather one who is a "servant leader" to infact listen to the experts and foster an environment where DevOps is truly understood, practiced and embedded. This environment is a product and customer centric team with true empowerment. Not subject to any political or outside / horizontal interference.

However, even within teams, silos exist, which is why we at [Mechanical Rock](https://www.mechanicalrock.io/) are passionate about Behaviour Driven Development (BDD). BDD enhances the performance of agile teams by taking their collaboration to a new level. As a byproduct it provides a set of living documentation and automated tests, which underpin the DevOps movement. By that I mean it provides a vehicle for collaboration and automates away the drudgery as a byproduct.

We've also extended this to use [Behaviour Driven Infrastructure](https://mechanicalrock.github.io//bdd/devops/2016/12/21/introducing-infrastructure-mapping) and TDD to develop infrastructure to remove silos within teams and provide configuration and compliance checks as a byproduct.

If you approach a problem correctly, using test-first development, then building, packaging, deploying and testing an application becomes much easier. The operation of a product which is well architected, well tested and is subject to constant releases, becomes almost trivial. Add modern Application Performance Monitoring (APM) and logging systems into the mix and issues in Production are visible to the entire team and can be solved in a near real-time feedback loop, especially when the team responsible for the quality of the product operates it.
