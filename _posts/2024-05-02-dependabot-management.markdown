---
layout: postv2
title: "Dependabot Management - Notification Fatigue, AWS CodeArtifact and Transient Dependencies"
description: "Dependabot is a useful free tool for managing dependencies in your GitHub repositories. This blog discuss some common issues with the tool and some solutions"
date: 2024-5-2
highlight: monokai
image: /img/dependabot-management/cover_photo.png
author: Matthew Carter
tags:
  [
    Dependabot,
    AWS CodeArtifact,
    Transient Dependencies,
    GitHub,
    Spam,
    AWS CodeArtifact and GitHub Dependabot Configuration,
  ]
---

# Dependabot Management - Notification Fatigue, AWS CodeArtifact and Transient Dependencies

## Introduction

Dependabot was rejected by YC Startup school in 2018 before being acquired and integrated into Github in 2019. It is a free tool that allows developers to better manage the dependencies of their projects in Github repositories. Dependabot is useful tool that supports a wide range of languages including, JavaScript, Python, Java and .NET. In addition, out of the box it creates pull requests to update dependencies in your repository, whether its patch, minor, or major updates and it also supports security updates. It can be configured at both an organisation level, though with limited controls, and most effectively at the repository level. Using Dependabot can feel a bit like being a code janitor, below are some common issues and solutions to managing Dependabot to hopefully make it a little less painful.

## Common Issues Dependabot

### Spam / Notification Fatigue

<center>
<div ><img src="/img/dependabot-management/notification_fatigue.png" width="600px"/><p>Image 1: Notification Fatigue</p></div>
</center>

Does this look familiar ? If so, my condolences, comrade.  
Dependabot when left unchecked can be a source of what feels like spam pull requests. Above we can see 49/51 open pull requests are related to dependencies updates and there are 34 security issues that need addressing. This is overwhelming and can lead to developers, understandably, ignoring these notifications. This can increase the attack surface of an application or organisation. With enough time and neglect this can contribute to the broken window effect, see <a href="https://medium.com/@learnstuff.io/broken-window-theory-in-software-development-bef627a1ce99"> here </a> for more details.

## AWS CodeArtifact

<center>
<div ><img src="/img/dependabot-management/code_artifact_issue.png"/><p>Image 2: AWS CodeArtifact</p></div>
</center>

Another common issue encountered with Dependabot is the inability to authenticate with AWS CodeArtifact at a organisation level (to my knowledge). AWS CodeArtifact is used for a variety of reasons including storing private packages and sharing them across your organisation. In the context of Dependabot updates, this can cause an issue as it is not supported out of the box. See Image 2: AWS CodeArtifact. Here, the original package is stored in AWS CodeArtifact and the updated package is stored in the public npm registry. This can cause issues with the integrity of the package and the security of the application.

### Transient Dependencies

Finally, another common issue with Dependabot is the handling of transient dependencies. Transient dependencies are dependencies that are not directly used by the application but are used by the dependencies of the application. A common situation where this becomes a problem is when you want have a large number of PRs, each containing a transient dependency upgrade.

## Solutions

### Notification Fatigue

The first solution to notification fatigue is to limit the number and type of PRs raised by Dependabot. Before raising those eyebrows please keep in mind this is exclusive of security updates. In fact, Security update PRs from Dependabot are not able to be limited by config file. I am only talking about patch and minor upgrades being turned off.

To put these limits in place we can create a `.github/dependabot.yml` file in the root of the repository. This file can be used to configure the behavior of Dependabot. Below is an example of a configuration file that limits the number and type of PRs raised by Dependabot.

```yaml
version: 2

updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
    commit-message:
      prefix: "Update"
      include: "scope"
    ignore:
      - dependency-name: "*"
        update-types:
          ["version-update:semver-patch", "version-update:semver-minor"]
```

For a node project in the root directory, this configuration file limits Dependabot to 5 open PRs at a time and only allows major updates. Please note this does not include security updates, these are raised irrespective of the `open-pull-requests-limit` parameter. The `ignore` parameter is used to ignore all patch and minor updates.

In addition, prefixing the PRs with `Update` and including the scope of the update in the commit message can help with the readability of the PRs.

With this, at every sprint planning within our team we review the open security and major update PRs of our main repositories, and decide which ones to tackle in the upcoming sprint. However, this in line with our own ways of working at Mechanical Rock and might not be suitable for all teams.

### AWS CodeArtifact and GitHub Dependabot Configuration

Unfortunately, to solve this issue it is not super straight forward and numerous poor tutorials exist online.
To use Dependabot with AWS CodeArtifact, a registry needs to be defined in the `.github/dependabot.yml` file for each repository. This is unfortunately not supported at an organisation level and uses a token which can be defined in the organisation secrets. Though there are some important security considerations for that token.

Here is an example of the Dependabot configuration for a repository using AWS CodeArtifact.

```yaml
version: 2
registries:
  npm-codeartifact:
    type: npm-registry
    url: ** AWS CodeArtifact URL HERE **
    token: ${{ secrets.AWS_CODEARTIFACT_TOKEN }}

updates:
  - package-ecosystem: "npm"
    registries:
      - npm-codeartifact
    directory: "/"
    #  ... see code example above for the rest of the configuration
```

Above, the registry `npm-codeartifact` is defined with the URL of the AWS CodeArtifact repository and the token is defined in the organisation secrets.

Most tutorials recommend using a long lived AWS token for this. However, for an organisation using GitHub, it is more appropriate to create or use a separate repository for provisioning organisation level resources. In the case of AWS CodeArtifact, within this separate repository create an OIDC connection between this repo and AWS. This way there is a secure connection to AWS inside a GitHub Action's workflow.

Then create a workflow to automate the creation of short lived tokens for Dependabot that are stored as organisation level secrets. This way the token is only valid for a short period of time and is rotated regularly. This is a more secure way of managing the token and is in line with the principle of least privilege.

```yaml
name: Manage AWS CodeArtifact Secret

# This GitHub workflow, automates the process of creating, or updating a secret at the organisation level using a GitHub App.

on:
  push:
    branches:
      - main
  schedule:
    - cron: "50 */7 * * *" # At minute 50 past every 7th hour every day.

jobs:
  manage-secret:
   #  ...
    steps:
      - uses: actions/checkout@v3
      #...
      - name: Set AWS CodeArtifact Secrets for Actions and Dependabot
        env:
          GITHUB_TOKEN: ${{ steps.generate_token.outputs.token }}
          ORG: ** GH ORG NAME HERE **
        run: |
          aws codeartifact get-authorization-token --domain ** CodeArtifact domain name ** --domain-owner ** CodeArtifact domain owner ** --query authorizationToken --output text --region ap-southeast-2 --duration-seconds 28800 >> aws-codeartifact-token.txt
          gh secret set AWS_CODEARTIFACT_TOKEN --app dependabot --org ${{ env.ORG }} --visibility all < aws-codeartifact-token.txt
```

<details>
<summary>
SEE FULL CODE HERE
</summary>

```yaml
name: Manage AWS CodeArtifact Secret

# This GitHub workflow, automates the process of creating, or updating a secret at the organisation level using a GitHub App.

on:
  pull_request:
    branches:
      - main
  push:
    branches:
      - main
  schedule:
    - cron: "50 */7 * * *" # At minute 50 past every 7th hour every day.
jobs:
  manage-secret:
    runs-on: ubuntu-latest

    permissions:
      id-token: write
      contents: read

    steps:
      - uses: actions/checkout@v3

      - name: GitHub App token
        id: generate_token
        uses: actions/create-github-app-token@v1
        with:
          app-id: ${{ secrets.GH_APP_ID }}
          private-key: ${{ secrets.GH_APP_PRIVATE_KEY }}

      - name: Assume deployment role
        uses: aws-actions/configure-aws-credentials@v3
        with:
          role-to-assume: arn:aws:iam::123456789012:role/aws-iam-role-arn
          aws-region: ap-southeast-2

      - name: Set AWS CodeArtifact Secrets for Actions and Dependabot
        env:
          GITHUB_TOKEN: ${{ steps.generate_token.outputs.token }}
          ORG: ** GH ORG NAME HERE **
        run: |
          aws codeartifact get-authorization-token --domain ** CodeArtifact domain name ** --domain-owner ** CodeArtifact domain owner ** --query authorizationToken --output text --region ap-southeast-2 --duration-seconds 28800 >> aws-codeartifact-token.txt
          gh secret set AWS_CODEARTIFACT_TOKEN --app dependabot --org ${{ env.ORG }} --visibility all < aws-codeartifact-token.txt
```

</details>

#### A Note on Action: create-github-app-token

This action lets you impersonate a GitHub App when secrets.GITHUB_TOKEN's limitations are too restrictive and a personal access token is not suitable. This is especially appropriate for github organisation's, see <a href="https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/differences-between-github-apps-and-oauth-apps#machine-vs-bot-accounts">here</a>. A GitHub is super easy to setup for this purpose and can be installed for the organisation with limit access to Dependabot's secrets and the specific repo's actions. You don't even need code for your Github App. See the need permissions below. Keep in mind I created this app on my personal account and installed it for my organisation.

<center>
<div ><img src="/img/dependabot-management/gh_app_permissions.png" width="600px"/><p>Image 3: GitHub App Permissions.</p></div>
</center>

<br>

## Transient Dependencies

One final gotcha I found while working with Dependabot is transient dependencies or dependencies of dependencies. Specifically, when you want combine a large number of PRs each containing a separate transient dependency. There is no special way to do this, and in fact the best way for node packages in `npm upgrade`. A more blunt and arguably stupid way to do it is to delete the `package-lock.json` file and then run `npm install`. This will update all the dependencies to the latest version, however, this is not recommended as it defeats the purpose of having a lock file in the first place, being a source of truth for the dependencies of the application.

Once you've work tirelessly to updated a wide range of packages, maybe in your own PR informed by Dependabot, you may see that Dependabot's PRs are still open. This will be solved when dependabot runs on its schedule, however to see immediate results comment `@dependabot rebase` or `@dependabot create`on the PRs. This will rebase/recreate the PRs and close them if they are no longer needed.

## A Note on Testing

Updating packages can be painful for a number of reasons. One of particular importance is ensuring nothing breaks once something is updated. If your application has no testing, and you wish for your application to continue working after complete a package update, you need testing in place. If this testing is manual, tackling 49 pull requests can take a long time. With automated testing, the time taken can be vastly reduced. If you want exemplary automated unit, integration and end to end testing, I recommend chatting to <a href="https://www.mechanicalrock.io/lets-get-started">Mechanical Rock</a>.

## Conclusion

Dependabot can be a bit of headache to use, hopefully with the solutions discussed above it can be less painful.
