---
layout: post
title: Thoughts on Serverless in 2020
date: 2020-06-02
tags: aws serverless cloud
author: Matthew Tyler
image: img/vogels.jpg
---

<center><img src="/img/vogels.jpg" /></center>
<br/>

While it has felt like the last two months have taken four hundred years, the reality is that we aren't even halfway through 2020. At any rate, it feels like an appropriate time to talk about the trends I see in serverless. More specifically, the things I see happening in the ecosystem, and the current things that bug me when working with serverless. This lies somewhere between having a whinge about the current state of certain things, whilst also noting that I can see serverless has a whole evolving into a method of software development that is both increasingly powerful whilst becoming easier to use.

# Better Observability Tools

There is currently an explosion of various observability tools in the serverless space. Thundra and Epsagon are probably the two the most talked about at the moment, and the Serverless Framework has its own features for monitoring applications as part of its enterprise offering. AWS is continuing to invest heavily in its own tooling; producing the embedded CloudWatch Metric format, as well as creating ways to consolidate observability data through the cross-account, cross-region dashboarding and via Service Lens. It's clear that there is a lot of activity in this space; AWS has traditionally neglected this element of the development experience but they have invested a lot of time in this area recently. I'm usually hesitant to use third-party vendor tooling for serverless observability, though I can certainly understand why people may want to use a vendor tool for tracing. X-Ray isn't always pleasant to work with as the SDK's are starting to show their age, and many of the newer SDK's do not have client support for X-Ray at all.

# Frameworks are improving the CI/CD experience

AWS has a lot of depth and breadth to its services, but it doesn't always combine them seamlessly. Configuring API Gateway and Lambda in vanilla CloudFormation can be painful. Frameworks like SAM and Serverless Framework have stepped up to make it easier to deploy these fairly standard configurations of AWS components. Once you are beyond that point and want to start deploying to production you need something more than manual deployments; you want a fully-fledged continous delivery pipeline with all the trimmings (e.g. test environments, blue/green deployments). SAM has integration with CodeDeploy, enabling lambda functions to be deployed via blue/green traffic shifting. Serverless Framework's enterprise edition adds its own method of deploying to multiple environments. Stackery has its own concept of environments as well. I think we'll continue to see improvement in this space, particulary around test/verification of staging environments, and easy ways to implement deployments with zero downtime via traffic shifting. 

I think most teams need additional help with moving up the CI/CD maturity curve. I see plenty of teams have who have reasonably good CI processes, a decent pipeline, but with poor integration test suites and manual gates.

# Stronger Typing and Validation

Werner Vogels promise me that my future would be filled primarily with business logic. I wish to inform him that while there have been significant reductions in the amount of boiler plate, I still find myself writing an abundance of code to validate, deserialize and type-check. I have seen some improvements from the proliferation of type-safe SDKs and managed services. Various transformation abilities in other services, like the ones found in API Gateway, EventBridge and Step Functions, have also helped. But I would like to see additional validation features in AWS Lambda that I can use at the infrastructure level. Tim Wagner, the Former GM of Serverless at AWS, also espoused this in his [2020 Re:Invent wishlist](https://medium.com/@timawagner/tims-take-re-invent-2020-serverless-wishlist-7f0756da4cd0). I shouldn't have to keep packaging external dependencies to do this and I'm hoping I won't have to for much longer.

# Better Integration Between Services

More and more integrations seem to keep coming for various solutions. EventBridge makes it very easy to stitch things together; it's incredible what you can do with [CodeBuild and EventBridge triggers](https://aws.amazon.com/blogs/devops/using-aws-codebuild-to-execute-administrative-tasks/). Step Functions keep getting more and more service integrations. API Gateway and AppSync provide direct service integrations, it's just a shame that it is with VTL. I'd like to see a better way to perform those transformations with something other than VTL - potentially something via a WASM executable that fits a particular interface, so I can choose what language to write it in. I'd expect AWS would ship some sort of library I could use with a subset of useful functions that I could use within the WASM runtime. That would be a hell of a lot more convenient than using VTL. Will it happen? Probably not. Is it possible? Wouldn't have a clue; I don't know that much about WASM. But that's the developer experience I want.

# QoL Improvements for Identity and Security

Secrets handling tends to frustrate me. I feel like I'm often writing code to pull down secrets. Then writing code to cache those secrets so I don't need to make the external call. Then writing more code to refresh those tokens when they expire. I'd love it if the platform could send a signal to the container/lambda system that let's it know that a secret has a changed, so it should start recycling the execution context, which would cause it to pull its configuration again.

I'd also like to see better support for RBAC in API Gateway. I wish I could propogate claims onto session tags when using native IAM integration. I wish I could define simple checks on token claims (other than just the audience and scopes) in a JWT authorizer. The more of that information I can propogate to the plaftform (instead of defined in code), the easier it is for me to configure automation to audit my environments and scale best practices out to many teams.

# Better Developer Experiences

An awful lot of the services offered by AWS are fairly simple building blocks; EC2, VPC, and even S3 being fairly good examples. They are all the basic building blocks of the internet. But they are not necessarily what a developer wants if all they want to do is deploy a basic API or a website, and thus we've seen various PaaS systems like Heroku gain a fairly sizeable share of the market. I think the Amplify Console is perhaps the biggest sign that AWS understands this, as it offers a fairly compelling user experience compared to building something similar out of the base services. It takes a lot longer to build something out of S3, CloudFont, and CodePipeline when compared to Amplify. It may not be perfect (e.g. it's missing cross-account deployment capability), but it's an indication that AWS is willing to offer services that offer a cohesive developer experience from soup to nuts. But they better hurry; there is increasing competition from GCP, and Github (now owned by Microsoft) has been hitting it out of the park with GitHub Actions, Package Manager, and Codespaces.

# In Closing; The Maturity of Serverless

I repeatedly hear talk of serverless being immature and not ready for production. I often hear that 'best practices' have not been established. There is obviously a kernel of truth to this; serverless as we know really only began to take off from 2015 and beyond. You may look at that and consider five years as a long period of time in technology, but the reality is that serverless has grown and changed a lot in that time. Besides, Kubernetes is pretty much the same age and it's not like every company is running it either. There are more resources out there now for learning serverless than there was five years ago; content is being produced by AWS and early-adopters alike, there are entire conferences around it, and it feels like there is a new podcast on serverless every week. The tribe has formed, the conversations are being had, and we are slowly seeing the best practices begin to rise to the top. The list of things that serverless cannot do is rapidly shrinking.

Serverless is More! [Contact Mechanical Rock to Get Started!](https://www.mechanicalrock.io/lets-get-started)

