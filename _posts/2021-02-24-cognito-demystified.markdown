---
layout: post
title: Cognito Demysitifed
date: 2021-02-24
tags: rbac serverless security aws cognito
author: Nate Jombwe
image: img/blog/cognito-demystified/confused.jpg
description:  At first, understanding how AWS Cognito operates can feel like solving a mystery. If you have been looking for a simple and concise explanation, here it is.  
---

Day-to-day, I'm obsessed with helping my clients solve their business problems using the latest and greatest the internet has to offer. This means I spend a lot of time translating vendor techno-babble into usable information. One thing that comes up time and time again is how to securely provide Sign-up/in and user profile services for an app built in AWS, in a user-friendly fashion. If you're lucky, by now, you have probably heard of [AWS Cognito](https://aws.amazon.com/cognito/), with possibly a little bit of knowledge of how it works and what it can do for you. If you're luckier, you may even know more!

Cognito, in my opinion, is one of the most valuable services that is currently on offer from AWS. Without a lot of detailed configuration, Cognito enables Role Based Access Control (RBAC) and secure user access for your apps in AWS. At first, understanding how AWS Cognito operates can feel like solving a mystery (WTF is the difference between a User Pool and an Identity Pool!?). If you have been looking for a simple and *somewhat* concise explanation, here it is. I would love to show you. 

## Modern Problem, Modern Solution. 🚀

Say you are a cryptocurrency fanatic, and you are determined to spread your distinctive, in-depth, Google search acquired knowledge to others on the internet in the form of a subscription service (knowing the demographic of those of you reading this, this isn't far fetched). Like any good subscription service, you aim to release diluted content to the masses for free, littered with advertisements, and place the good stuff behind a paywall. Building a website on AWS delivering text based content likely will not be a challenge, although you're going to have to decide how to manage user accounts, metadata, and subscription information. Furthermore, how are you going to protect your money making content?  How are you going to do this at scale? How are you going to make the user experience seamless? Will Dogecoin ever reach the moon?

Well hear this, Amazon Cognito lets you add user sign-up, sign-in, and access control to your web and mobile apps quickly and easily. Amazon Cognito scales to millions of users and supports sign-in with social identity providers, such as Apple, Facebook, Google, and Amazon, and enterprise identity providers via SAML 2.0 and OpenID Connect. In more relatable terms, Cognito enables you to provide a user account experience for your app that is on par with what people are used to nowadays. No Dogecoin required.


## Building Blocks: User Pools and Identity Pools 👨‍👩‍👧‍👦

### User Pools

**In the simplest terms possible, a User Pool is a user directory.** Like any decent directory, it allows you to create, confirm, and manage users accounts. Beyond basic diretory features and storing user meta-data such as the names, addresses, and phone numbers of you users, User Pools provide the capabilty for users to sign in through third party identity providers like Google, Facebook, Amazon, Apple, through SAML identity providers, or directly into the pool itself. Additionally, you can create an AWS Lambda function that is triggered during user pool operations such as user sign-up, confirmation, and sign-in (authentication) with a [Lambda trigger](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools-working-with-aws-lambda-triggers.html). You can even add authentication challenges, migrate users, and customise verification messages.

So in terms of developing a solution to manage user accounts, metadata, and subscription information, User Pools are a pretty good fit. 

Common scenarios such as Accessing Server-side Resources after Sign-in, and Accessing Resources with API Gateway and Lambda After Sign-in, are laid out in detail [here](https://docs.aws.amazon.com/cognito/latest/developerguide/accessing-resources.html).

#### Tokens 
![Basic User Pool Usage](/img/blog/cognito-demystified/scenario-authentication-cup.png)  <br />
**Cognito User Pools provides token handling and management for authenticated users from all identity providers**, so your backend systems can standardize on one set of user pool tokens. 

After a successful authentication via a User Pool, the [user pool tokens](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-with-identity-providers.html) are returned to your app. You can use these tokens to grant your users access to your own server-side resources or to AWS resources such as API Gateway and AppSync. Amazon Cognito user pools implements ID, access, and refresh tokens as defined by the OpenID Connect (OIDC) open standard:
- The ID token contains claims about the identity of the authenticated user such as name, email, and phone_number.
- The access token contains scopes and groups and is used to grant access to authorized resources.
- The refresh token contains the information necessary to obtain a new ID or access token. 

Information regarding Using the ID Token, Using the Access Token, Using the Refresh Token, Revoking All Tokens for a User, and Verifying a JSON Web Token can be found [here](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-with-identity-providers.html).

#### User Pool App Clients and Domains
After you create a user pool, you can **create an App Client for use in built-in webpages for signing up and signing in your users**. 
If custom building all of your UI components is not your thing, you can provision a hosted authentication UI that you can add to your app to handle sign-up and sign-in workflows provided by a User Pool. You can use the AWS Management Console, or the AWS CLI or API, to [specify customisation settings](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-app-ui-customization.html) for the built-in app UI experience. You can even upload a custom logo image to be displayed in the app and choose many CSS customizations. Fancy.

If you configure your user pool to require email verification, Amazon Cognito has the ability to send an email when a user signs up for a new account in your app or resets their password. Depending on the action that initiates the email, the email contains a verification code or a temporary password.

To handle email delivery, you can use either of the following options:
- [The default email functionality that is built into the Amazon Cognito service](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-email.html#user-pool-email-default)
- [Your Amazon SES configuration](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-email.html#user-pool-email-developer)
These settings are reversible. When needed, you can update your user pool to switch between them.

After setting up an app client, you can configure the address of your sign-up and sign-in webpages. You can use an Amazon Cognito hosted domain and choose an available domain prefix, or you can use your own web address as a custom domain.The following links explain the respective processes:

 - [Using the Amazon Cognito Domain for the Hosted UI](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-assign-domain-prefix.html)
 - [Using Your Own Domain for the Hosted UI](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-add-custom-domain.html)


### Identity Pools

Amazon Cognito identity pools enable you to create unique identities and assign permissions for users. **Identity pools allow users to obtain temporary AWS credentials with permissions you define to *directly access other AWS services***.  Using Identity Pools, you can segreate user's access to content/services. Your identity pool can include:

- Users in an Amazon Cognito user pool
- Users who authenticate with external identity providers such as Facebook, Google, Apple, or a SAML-based identity provider
- Users authenticated via your own existing authentication process

Yes, that's correct. **Users can authenticate directly against a User Pool *or* an Identity Pool**, but a user can solely authenticate against a User Pool and obtain credentials associated with a related Identity Pool. Bit confusing, isn't it? It is easier to understand when remember that Identity Pools exist to provide users the ability to *directly access other AWS services*.

![Identity Pool Usage](/img/blog/cognito-demystified/scenario-Identity.png)   <br />


#### Authenticated and Unauthenticated User Roles/Identities 🔐

**Identity pools define two types of identities: authenticated and unauthenticated**. Every identity in your identity pool is either authenticated or unauthenticated. Authenticated identities belong to users who are authenticated by a [public login provider](https://docs.aws.amazon.com/cognito/latest/developerguide/external-identity-providers.html) (Amazon Cognito user pools, Login with Amazon, Sign in with Apple, Facebook, Google, SAML, or any OpenID Connect Providers) or a developer provider ([your own backend authentication process](https://docs.aws.amazon.com/cognito/latest/developerguide/developer-authenticated-identities.html)). Unauthenticated identities typically belong to guest users.

For each identity type, there is an assigned IAM role. This role has a policy attached to it which dictates which AWS services that role can access. When Amazon Cognito receives a request, the service will determine the identity type, determine the role assigned to that identity type, and use the policy attached to that role to respond. By modifying a policy or assigning a different role to an identity type, you can control which AWS services an identity type can access.

This is how you are going to protect your money making content. When a user logs in to your app, authenticating via a User Pool, or directly via an Identity Pool, or as a guest, Amazon Cognito generates temporary AWS credentials for the user. These temporary credentials are associated with a specific IAM role associated the with the related authenticated or unauthenticated context. The associated IAM role lets you define a set of permissions to access your AWS resources. 

By default, the Amazon Cognito Console creates IAM roles that provide access to Amazon Mobile Analytics and to Amazon Cognito Sync. Alternatively, you can choose to use existing IAM roles. For example, you may desire to extend these roles to protect API level content in AppSync (precious pump-and-dump predicitions), or static files in S3 (inspirational images of Elon Musk).

The permissions in access policies attached to a role are effective across all users that assume that role. If you want to partition your users' access, you can do so via policy variables. Be careful when including your users' identity IDs in your access policies, particularly for unauthenticated identities as these may change if the user chooses to login. But this probably isn't the blog post to dig into that detail. Examples of and guidance for access policies can be found [here](https://docs.aws.amazon.com/cognito/latest/developerguide/iam-roles.html).


### Stop Reading, Start Doing 😤

Maybe not as concise as I thought! I haven't even spoken about User Pool Groups yet...nevertheless, hopefully cognito seems a bit less scary - there's plenty of information here to get you started. The best way of learning is doing, so if Cognito sounds like it could work for you, do it. Whats the worst that could happen? 😉
<br /><br />
If you are interested in learning more about progressive product development in the cloud, get in touch and let's have a chat over a coffee - my shout!  Or if you are ready to build a slick, efficient, scalable application in the cloud and need some guidance, get in touch with us at [Mechanical Rock](https://mechanicalrock.io/lets-get-started).



> *Nate takes pride in delivering outcomes for his clients using modern software development tools and processes.Through his persistent effort to learn more about how technology fits into the world around us, Nate has developed a passion for showing empathy to better understand and solve business problems. But don’t let any of this fool you, it should not be a surprise when Nate engages you in a healthy debate as to why Jeff is, and will always be the best member of The Wiggles, when Nate routinely overestimates how many donuts he can fit in his mouth, or when Nate inevitably tells you a dirty joke.*