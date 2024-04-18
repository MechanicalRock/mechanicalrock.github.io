---
layout: post
title: Leaked Credentials!
date: 2023-6-20
tags: aws account control tower sso organizations credentials permission policy
author: Bret Comstock Waldow
---
# Summary
This is a discussion of issues due to leaked AWS credentials and suggestions of how to avoid these problems.
# AWS Credentials & types
AWS credentials permit a user to assume an AWS identity.  Depending on the type of AWS identity, the identity may also have inherent or assigned permission to acess AWS resources and initiate actions with them.

This identity is called a 'login', and the identity may be specific to one account or may offer access to several.  It is not an account, and by itself has no powers - actions are taken in one or more accounts.

Credentials will include an identifier (username), and a password.  Further protections to assuming an identity may include one of several types of Multi-factor Authentication (MFA) token or policy limits on the context the identity is valid for (specific account, region, etc).  Some types of credentials also include a token which includes hashed details of the username, account, time and perhaps other details.
## AWS Identities
### Account Root user
This identity is created with each new account and has undeniable access to all resources within that account.

The identifier is the email address used to create the account and a password, which may not be set at creation.  Optionally, an MFA token may be assigned to the identity.
### IAM User
This optional identity is created within an account and has only the permissions granted to it.  Optionally, an MFA token may be assigned to the identity.
## Console vs CLI
The AWS Console is a GUI web interface presenting state and controls for an AWS account.  The CLI is the Command Line Interface which is an AWS program which is run in a text terminal which reports about and acts on an AWS account according to program arguments provided when invoked.

Both require an identity and supporting authentication secrets (password, MFA, token).
### SSO/IAM Identity Center User
AWS provided a feature named SSO (Single Sign On) and has renamed this to Identity Center, however many documents refer to SSO, and the CLI command is still named SSO.

This approach offers a login, which may then be permitted access to several accounts with varying permission.

The access may be to the GUI console, or temporary credentials may be given to permit CLI access.
## IAM vs SSO
IAM (not SSO) credentials are not time limited, but remain valid until deliberately cancelled.  There are situations where IAM users may be needed, but it is generally wise to avoid using them to avoid the possibility of leaking such permanent credentials.
## Temporary credentials
SSO credentials are time limited, and must be renewed periodically.  When CLI SSO credentials are acquired, a token is included which hashes a timestamp for the time acquired, and the credentials will not be honored after the time the credentials are set to expire.  This makes them much safer for use.
# Credential leakage, attendent risks
Leaked credentials may be used to carry out the same operations as they are legitimately intended for and often for many more uses.

The Internet is surveilled by many actors, and also credentials commited to repositories such as Github and Bitbucket will be noted, harvested, and put into use within minutes.  These mis-uses can lead to several negative outcomes:
- Substantial bills for resources.
- Breach of company data.
- Loss of reputation if the breach is publicised.
# Defenses
Don't leak credentials.  But how?

AWS has introduced a range of facilities and tools through time to address vulnerabilities of it's original approaches - IAM users instead of root users, 'child' account roles instead of proliferating IAM users, SSO with temporary credentials instead of IAM users with permanent credentials.

There are tools to acquire credentials without exposing them and I will not enumerate them here - they change, and reading up-to-date docs is the best way to learn about them.

I will discuss a solution we have developed to invalidate leaked credentials that doesn't seem to be noted by AWS at the time I'm writing this.
## AWS suggestions
AWS has many suggestions for different scenarios.  You may start here, but this is certainly not exhaustive: [AWS security credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/security-creds.html)
## Our approaches
Our large clients generally have their own AWS administrators, and they provide their own security approaches, although we may advise them about issues that we encounter.  In this section, I'm going to discuss approaches we take in our own company accounts, which support a collection of consultants rather than production systems.

To avoid problems with leaked credentials, we try hard not to use them.  In fact, I use them all the time in my administrative work, but I never write them down in a file I might save, there is no avenue to publish (leak) them.

We avoid using IAM users because those may be issued permanent credentials - we don't need them generally and thus can't leak those credentials.

Our root users do not have assigned passwords - we always recover the password when we need to operate at that level and do not save the recovered password - so it is not written anywhere that might be published.  We also have a hardware MFA token assigned to each root user and that must be used to recover the password.  We only operate as a root user when there is no other option - mostly we only do so to assign that hardware MFA, and we might use it to stop an attack some day.

We use SSO/IAM Identity Center users for almost all of our AWS access.  Each individual account has it's own root user, and each can have IAM users, but we gather our accounts into an Organization and access them all through SSO which means the credentials are always temporary, and also subject to some helpful controls.
## No invalidation, but credentials may be ignored
SSO credentials, whether for Console access or for CLI use, have temporary lifespans.  This lifespan is long enough for serious mischief to occur if leaked to a hostile party, or even a less-competent one.

While these credentials expire, during their lifespan, they are independent and AWS offers no way to cancel them.  However, a clause in a well-targeted policy leads to them being ignored, which is just as effective.
## Permission set approach
### Timestamp
### UserId
# DoS risks
# DoS mitigation