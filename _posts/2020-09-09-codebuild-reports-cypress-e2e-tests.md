---
layout: post
title: "Adding CodeBuild reports to Cypress e2e tests using CDK"
date: 2020-09-09
tags: aws codebuild reports testing devops
author: Natalie Laing
image:
---

![Cypress CodeBuild report](/img/Cypress-CodeBuildReport.png)

## Set up your infrastructure:

Firstly you will need to set up your infrastructure as code, in this scenario that happens to be using AWS CDK.

In your non prod and prod deployment stack add the following to your post build.
When you run Cypress in your local development you will see that is is waiting for a response from localhost to run the tests against. In the post build we can tell Cypress to go and run the integration tests on the specified url.

```ts
post_build: {
    commands: [
      "cd ../e2e && npm ci",
      "CYPRESS_BASE_URL=https://my-site-goes-here.com npm run report"
    ],
  }
```

In your non prod and prod deployment stack add the following to your reports section.
This adds the references to the files you want CodeBuild reports to generate. I included my unit tests and e2e tests.

Create an IAM policy which allows logging:

- logs:CreateLogStream
- logs:CreateLogGroup
- logs:PutLogEvents

Create an IAM policy which allows reporting:

- codebuild:CreateReportGroup
- codebuild:CreateReport
- codebuild:UpdateReport
- codebuild:BatchPutTestCases

```ts
reports: {
    CIReports: {
        files: ["frontend/junit.xml", "e2e/cypress/results/*.xml"],
        "discard-paths": "yes",
      },
    },

    new iam.PolicyStatement({
        actions: ["logs:CreateLogStream", "logs:CreateLogGroup", "logs:PutLogEvents"],
        effect: iam.Effect.ALLOW,
        resources: [
          `arn:aws:logs:${props.nonProdEnv.region}:${props.nonProdEnv.account}:log-group:/aws/codebuild/your-file-path-*`,
        ],
    }),

    new iam.PolicyStatement({
        actions: [
          "codebuild:CreateReportGroup",
          "codebuild:CreateReport",
          "codebuild:UpdateReport",
          "codebuild:BatchPutTestCases",
        ],
        effect: iam.Effect.ALLOW,
        resources: [
          `arn:aws:codebuild:${props.nonProdEnv.region}:${props.nonProdEnv.account}:report-group/your-file-path-*`,
        ],
    })
```

## Reporter config.json

In the reporter config specify what reporters you will be using in the reporter enabled property.
I used mocha junit reporter and specified where I want my files to be saved. This will need to be unique so I used [hash] to give the file a unique hash value so that I can merge these for the CodeBuild report.

**BEWARE: CodeBuild reports are very specific about what file formats are accepted**

For more information check out the documentation [here](https://docs.aws.amazon.com/codebuild/latest/userguide/test-reporting.html)

```json
{
  "reporterEnabled": "spec, mocha-junit-reporter",
  "mochaJunitReporterReporterOptions": {
    "mochaFile": "cypress/results/results-[hash].xml"
  }
}
```

## Cypress.json

In the Cypress json specify the reporter config we set up above.

```json
"reporter": "Cypress-multi-reporters",
 "reporterOptions": {
   "configFile": "reporter-config.json"
 }
```

## Package.json - in your Cypress directory

In the package.json in your Cypress directory set up the following script commands.
If the reports folder already exists then we want to remove everything in that folder before we run the e2e test.

```json
"scripts": {
    "test": "Cypress run",
    "cypress:open": "cypress open",
    "delete:reports": "rm cypress/results/* || true",
    "prereport": "npm run delete:reports",
    "report": "cypress run --reporter cypress-multi-reporters --reporter-options configFile=reporter-config.json"
}
```

## Wrapping up
