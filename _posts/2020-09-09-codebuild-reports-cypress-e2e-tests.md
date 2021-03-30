---
layout: post
title: "Adding CodeBuild reports to Cypress e2e tests using CDK"
date: 2020-09-09
tags: aws codebuild reports testing devops
author: Natalie Laing
image: /img/reports.png
---

![Generic reports](/img/reports.png)

## Introduction

I was recently working on a project where the product owner wanted to be able to visualize our tests in one place without having to navigate through the codebase. This is where [CodeBuild](https://docs.aws.amazon.com/codebuild/latest/userguide/test-reporting.html) reports come in.

This enabled us to visualize the following:

- Pass rate
- Average report duration
- Average number of test cases run
- Number of reports generated
- Individual report duration
- Date the report was created
- Individual tests filterable by status

CodeBuild stores your test results for 30 days. Test results can be exported to S3 if you need them for more than 30 days.

![CodeBuild report directory](/img/CodeBuild-Reports-Finder.png)

## Set up your infrastructure:

Firstly, time to set up your infrastructure as code. In our case this was using [AWS CDK](https://docs.aws.amazon.com/cdk/latest/guide/home.html).

In your deployment stack add the following to your post-build.
When you run Cypress in your local development you will see that it is waiting for a response from localhost to run the tests against. In the post-build, we can tell Cypress to go and run the integration tests on the specified URL.

```ts
"CYPRESS_BASE_URL=https://my-site-goes-here.com npm run report";
```

In your deployment stack add the following to your reports section.
This adds the references to the files you want CodeBuild reports to generate.

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
        files: ["your files here"],
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

In the reporter config file specify what reporters you will be using in the reporter enabled property.
I used mocha junit reporter and specified where I want my files to be saved. This will need to be unique so be sure to gave the file a unique hash value. This will enable merging the tests for the CodeBuild report.

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

In the Cypress json specify the reporter options config file to be the reporter config.

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

CodeBuild reports enabled us to merge our unit tests and e2e tests into codebuild reports. This allowed us to visualise the failure rate and average duration. This enabled the product owner to get a holistic view of the project in a centralised location.

If you have any questions, feel free to [contact-us](https://www.mechanicalrock.io/lets-get-started).

![Cypress CodeBuild report](/img/Cypress-CodeBuildReport.png)
