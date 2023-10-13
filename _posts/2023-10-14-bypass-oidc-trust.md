---
layout: postv2
font: serif
title: "Bypassing Github branch protection with Environments"
description: "GitHub Environments changes the claim token provided to OIDC Providers and removes the Branch name from the Subject, this allows a user to authenticate via any branch"
date: 2023-10-14
highlight: monokai
image: /img/bypass-oidc-trust/cover.jpg
author: Chris Howard
tags: [Trust policy, GitHub, GitHub Environments, Security, OIDC]
---

# Bypassing GitHub branch protection with OIDC and Github Environments

As part of the deploying to AWS with Github Actions is the idea of using an OIDC provider to allow for temporary credentials that can be assumed during the pipeline to enable secure access to AWS accounts.

The documentation for which is located [here](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services#adding-the-identity-provider-to-aws) shows that you should configure your trust policy like so:

```
"Condition": {
  "StringEquals": {
    "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
    "token.actions.githubusercontent.com:sub": "repo:octo-org/octo-repo:ref:refs/heads/octo-branch"
  }
}
```

This configuration ensures that the only way that anyone can assume the deployment role is if the subject (sub) matches the specific branch name `octo-branch` if a deployment attempts to assume the role outside of that branch it will be denied, combined with standard branch protections (no code directly to branch, must have been via a Pull Request and have approvals by other approved members) ensures that the only way code can be deployed is via the review and approval process.

In contrary to the above, the documentation continues on to provide a way to create a Trust Policy when using GitHub environments:

> If you use a workflow with an environment, the sub field must reference the environment name: repo:OWNER/REPOSITORY:environment:NAME.
```
"Condition": {
  "StringEquals": {
    "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
    "token.actions.githubusercontent.com:sub": "repo:octo-org/octo-repo:environment:prod"
  }
}
```

Herein lies the issue: **There is no longer any reference to the branch name**

Github does provide the branch name as the `ref` value of the JWT [shown here](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect#understanding-the-oidc-token) so a way to validate the branch name is possible.

And then we go to check which values we can use as part of the Trust Policy condition operators [here](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_iam-condition-keys.html#cross-condition-keys-wif)

The available keys are:
  
  - amr
  - aud
  - id
  - sub

And the following Note:

> No other web identitiy based federation condition keys are available for use after the external identity provider (IdP) authentication and authorization for the initial AssumeRoleWithWebIdentity operation.

So our new trust policy has no access to the `ref` provided by GitHub which now means we have no way to check which branch the request is coming from.

# Testing the process

I've created this repo as an example of how this works.

Firstly we have full branch protection for `main` enabled and we get the approriate error when attempting to push

![Push Denied](/img/bypass-oidc-trust/push-denied.png){:lightbox="true"}

Our AWS Trust policy is configured with branch protection:

![Trust Policy](/img/bypass-oidc-trust/trust-policy.png){:lightbox="true"}

And our Merge is blocked:

![Merge Blocked](/img/bypass-oidc-trust/merge-blocked.png){:lightbox="true"}

The process works wholely as we expect, once the review is complete and the merge happens, the pipeline runes and we get deployed code:

![Pipeline Success](/img/bypass-oidc-trust/pipeline-success.png){:lightbox="true"}

## Malicious user enters the chat

Let's say we see this open source repository, and we want to be a bad person, We can attempt to run our own actions inside a branch, and uses GitHub Actions `on: push` we can essentially run anything we want even in branches

So we create a new branch, make some small modifications to our pipeline config and attempt to deploy code:

![Malicious Changes](/img/bypass-oidc-trust/malicious_changes.png){:lightbox="true"}
![Nefarious Action Running](/img/bypass-oidc-trust/nefarious_action.png){:lightbox="true"}

We have been thwarted by our OIDC trust policy!

![Thwarted](/img/bypass-oidc-trust/thwarted.png){:lightbox="true"}

## Move to Github Environments

Now, as a Developer, we want to try the Environments feature of Github to manage our deployments and and so we can have different secrets and reuse our pipeline configurations. We enable it, Realise that our Trust Policy no longer works (see above, the change in `sub`) so we update our Trust policy as describe in the [GitHub documentation](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services#adding-the-identity-provider-to-aws)

![Updated Trust Policy](/img/bypass-oidc-trust/updated-trust-policy.png){:lightbox="true"}

And add the environment to our pipeline, proceed through the review and merge process, and watch our updated pipeline perform as expected

![Added environment](/img/bypass-oidc-trust/added-environemnt.png){:lightbox="true"}
![Environment Deployed](/img/bypass-oidc-trust/environment-deploy.png){:lightbox="true"}

## Malicious user number two

Another bad actor notices this new change to use environments, so he attempts to do a deployment aswell.

Remember that now, we are no longer relying on the Trust Policy to limit our credentials to a specific branch because There is no reference to the branch in the Trust Policy due to the limited subset of options provided to us.

We can update the malicious branch with the new environment and push to our branch:

![Updated Branch](/img/bypass-oidc-trust/updated-malicious-pipeline.png){:lightbox="true"}

![Nefarious Action 2](/img/bypass-oidc-trust/nefarious-action-2.png){:lightbox="true"}

![Deloyed malicious bucket](/img/bypass-oidc-trust/deployed-malcious-bucket.png){:lightbox="true"}

![Buckets](/img/bypass-oidc-trust/buckets.png){:lightbox="true"}

# Conclusion

By simply following the documentation for configuring an OIDC provider that makes use of GitHub Environments, are you are completely able to bypass the branch protection feature of GitHub and use credentials that should be locked down to use by only a single branch.

In my opinion no user of the AWS Identity Provider should be using the GitHub Environment feature as it (by default, and with the expected setup based on documentation) makes your pipelines less secure.

# Remediation

If you **MUST** use GitHub environments for your deployments, to ensure that your credentials are not able to be assumed by any branch, you can [customize your GitHub claim token](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect#customizing-the-token-claims) and add that new custom claim to your trust policy