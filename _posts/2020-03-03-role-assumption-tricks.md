---
layout: post
title: AWS STS Role Chaining
date: 2020-03-03
tags: javascript tutorial serverless sam
author: Matthew Tyler
image: 
---

<center><img src="/img/serverless-express.png" /></center>
<br/>

# Introduction

At some point in your career using AWS, you'll find it nessecary to learn a little about how assuming roles in other accounts works. If your working on a personal account, chances are you used to logging in with an IAM user that you have created for yourself. When you join a company using AWS, it's more likely that they have a multi-account set-up using AWS Organizations with AWS SSO - in which case you will log into a specific account using a role via federated access. Likewise, you are probably used to needing to create roles for various services (like Lambda), and provide a service trust so that the service can use a role.

I've done a lot of control-plane work in my time, and this has nessecitated understanding a fair amount about how assuming roles works. A more complicated trick I've had to pull off is building automation that required role chaining - assuming a role into an account and from there, assuming a role into another account. You can think of this as using an account similar to how one would use a jump-box (or bastion host for non-Australians). Most of the time this has been to meet a security policy, delegating permissions management to an account managed by some central authority. This allows that party responsibility for access control, and the ability to closely monitor what is happening. 

<center><img src="/img/role-chaining/iam-double-jump.png" /></center>
<br/>

Assuming a role via the Javascript SDK is relatively simple, but is has become easier in recent times through the addition of a new credential provider in late 2018, known as 'ChainableTemporaryCredentials'. Prior to this, I used my own custom library which allowed me to do perform role chaining. However, my library did not not refresh credentials when they expired; this was less important for me because I tended to only use the library within lambda functions, and not long running compute. 'ChainableTemporaryCredentials' does handle credential refreshing, so it is a better solution than what I came up with.

Before we get into the specifics though, let's discuss a little bit about how role-assumption works in the simple two-account model.

# Cross Account Role Assumption

Setting up cross account role assumption can be a little confusing if you have never done it, but it will become second nature the more you do it. It works like this:

1. Create a role in the target account, that will ultimately be assumed by another account. Give it the necessary permissions to do what will be required of it.

2. Adjust the 'AssumeRolePolicy' or 'trust', of the target role. 

   The role will need to have a trust policy like the following;

   ```json
    {
      "Version": "2012-10-17",
      "Principal": {
        "AWS": [
          "arn:aws:iam::1234567890:root"
        ]
      },
      "Action": "sts:AssumeRole"
    }
   ```

   By calling out the account root, you are effectively delegating responsibility to the other account to manage who is allowed to access this role. Note however, that you cannot use wildcards in the trust policy, so you either trust the whole account or something more specific

3. Within the source account, create a role that is capable of assuming the role in the target account

   It will require IAM permissions that look like the following;

   ```json
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Action": "sts:AssumeRole",
          "Resource": "arn:aws:iam::098765431:role/role-to-assume",
        }
      ]
    }
   ```

Imagine we were to assume a role in another account to access S3 from within that context. The following code will assume role using the javascript SDK for this scenario, and provide those credentials to the S3 account. Using plain STS client calls, it looks like the following;

```javascript
import { S3, STS, Credentials } from "aws-sdk";

const { 
  Credentials: { 
    AccessKeyId: accessKeyId, 
    SecretAccessKey: secretAccessKey,
    SessionToken: sessionToken 
  } 
} = await new STS().assumeRole({
  RoleArn: "arn:aws:iam::0987654321:role/role-to-assume"
}).promise();

const client = new S3({
  credentials: new Credentials({ accessKeyId, secretAccessKey, SessionToken })
});
```

There's obviously a lot of boilerplate here, primarily because of the changing case of the input and output parameters between the response of the STS call and the credentials object. Removing this boilerplate was my reason for writing my own helper library in the first place. Now that ChainableTemporaryCredentials is around, we get rid of some the ceremony. Check this out;

```typescript
import { S3, ChainableTemporaryCredentials } from "aws-sdk";

const credentials = new ChainableTemporaryCredentials({
  params: {
    // Any parameters used by STS AssumeRole can be used here eg; RoleSessionName etc
    RoleArn: "arn:aws:iam::0987654321:role/role-to-assume"
  }
});

const client = new S3({ credentials });
```

# Role Chaining

Extending this to a third role that is assumable from a 'middle' role isn't an awful lot different from the example with two roles. We simply add another role, and place a trust on the role in the middle.

<center><img src="/img/role-chaining/iam-double-jump-trust.png" /></center>
<br/>

Using ChainableTemporaryCredentials we can perform the double-assumption by adding an additional parameter. 'masterCredentials' can be used to specify how the credentials to the top level call should be acquired.

```typescript
import { S3, ChainableTemporaryCredentials } from "aws-sdk";

const credentials = new ChainableTemporaryCredentials({
  params: {
    RoleArn: "arn:aws:iam::0101010101:role/next-role-to-assume"
  },
  masterCredentials: new AWS.ChainableTemporaryCredentials({
    params: { 
      RoleArn: "arn:aws:iam::0987654321:role/role-to-assume"
    }
  })
});

const client = new S3({ credentials });
```

Simples! You can probably imagine how ugly it gets when directly using STS calls, hence why I wrote my own library to handle it!

# Conclusion

We had a brief look at how cross-account role assumption works, and how to set it up in the simple two account case. We showed how to do this STS calls and how the ChainableTemporaryCredentials provider in Javascript SDK makes this easier. Then we added a third role, and showed how to perform role chaining via the credential provider. We gained an appreciation for how this makes the entire process simpler!

IAM got you feeling chained up? [Contact Mechanical Rock to Get Started!](https://www.mechanicalrock.io/lets-get-started)