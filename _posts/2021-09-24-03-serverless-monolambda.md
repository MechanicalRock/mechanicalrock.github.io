---
layout: post
title: "Building a Serverless RPC API on AWS: When is the mono lambda OK?"
date: 2021-09-23
tags: rpc grpc twirp aws api protobuf
author: Matt Tyler
image: img/twirp.png
---

<center><img src="/img/twirp.png" /></center>
<br/>

In the last installment we got the Twirp framework running inside a lambda function to serve requests sent to it via API Gateway. The more astute readers will have noticed that we have essentially installed a framework inside the lambda function to serve multiple routes, otherwise known as the "mono-lambda" pattern.

To reiterate slightly, the mono-lambda is generally identified by the following;

- A `/{proxy+}` route on API Gateway, directed to a single lambda function integration
- The presence of some framework (or at least some form of routing), commonly express.js or flask etc installed within the lambda function.

The mono-lambda is mostly considered an anti-pattern within the serverless community, as is running traditional web frameworks within a lambda function. A lot of the arguments come down to frameworks bloating the size of the code packages, including many dependencies with increase the attack surface for vulnerabilities, as well as (usually) throwing the principal of least priviledge out the window (as now every route has access to the same IAM role and actions, even if they don't need those permissions).

Of course, there are situations where a mono-lambda approach can work. However it is important to remember that none of these scenarios preclude one from learning the best-practice serverless approach - they are almost always situational trade-offs useful for optimizing on a specific axis, and this means they require discipline to realise when your team is starting to harm itself.

The most productive software teams are those that can leverage their hard-won experience, whilst also recognising that same experience can be a tomb. Likewise, sometimes what is suggested as best-practice, may not be best-right-now. The following list of circumstances is going to seem overly negative - but that is going to be the case whenever you want to go against the grain.

# When you want to trade on framework familiarity

If your team is extremely familiar with a particular framework, you might find you are more productive within the confines of it. If this enables your team to be more productive, it might be the right trade off for you to make. This doesn't exclude you from needing to learn the AWS Platform, but it may buy your team time to learn whilst still delivering. 

# When the IAM policies would be the same for a set of lambda functions

If you are a building a basic CRUD application, you might find a good portion of your lambda functions may end up with extremely similar permissions. For example, an API that follows a storage-first pattern may find that most of its handlers only write to DynamoDB, whilst using streams to perform the heavy lifting. In this case, the mono-lambda may be the less complex option.

# When you want to simplify the deployment model

A lesser number of things to deploy usually results in a simpler (and faster) deployment. You may find that certain kinds of deployments are just easier to reason about when deploying a service contained within the confines of one lambda function. Whilst one could certainly template out all the nessecary parts to deploy one lambda function and everything required for a traffic-shifting alias, complete with rollback alarms - it's once again more stuff to manage, and might be difficult for teams new to serverless to grok.

# When scalability isn't a huge concern

Segmenting an application into many different lambda functions has a good property from a scalability perspective - only the most popular routes are going to scale up when required. In a large mono-lambda everything is being scaled together regardless of differences in usage rates. That can result in wasted resources. Larger functions are generally slower to start than smaller functions, and consume more memory and CPU. If this isn't a concern though, you once again may find it useful to use a framework.

# Summing it up

This list of circumstances is going to seem overly negative - but that is going to be the case whenever you want to go against the grain. You aren't breaking the rules if you don't know what the rules are.

The mono-lambda approach may be worth taking if your team isn't going to hit any of the major penalties around security surfaces and scalability, AND your team is going to benefit from the efficiencies of using a particular framework. It's important for teams to have a bit of experience around each approach, so they can make the right choice based on their particular circumstances.

---

Don't be shy, [get in touch with us!](https://www.mechanicalrock.io/lets-get-started)

![Mechanical Rock Logo](/img/mr-logo-dark-landscape.jpg)
