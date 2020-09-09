---
layout: post
title: "Adding code build reports to cypress e2e tests using CDK"
date: 2020-09-09
tags: aws codebuild reports testing devops
author: Natalie Laing
image:
---

## Set up your infrastructure:

In your non prod and prod deployment add the following to your post build.

Instead of the browser parameter you can use the Cypress_BASE_URL parameter and set cypress to check your non prod and prod sites.
E.g.

```ts
CYPRESS_BASE_URL=https://my-site-goes-here.com
```

```ts

post_build: {
           commands: [
             "BROWSER=none npm run start & npx wait-on http://localhost:3000",
             "cd ../e2e && npm ci",
             "npm run report",
           ],
         },
```

In your non prod and prod deployment add the following to your reports section add references to the files you want the code build reports to pick up. I included my unit tests and e2e tests.

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
      `arn:aws:logs:${props.nonProdEnv.region}:${props.nonProdEnv.account}:log-group:/aws/codebuild/cloud-journey-simluation-*`,
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
      `arn:aws:codebuild:${props.nonProdEnv.region}:${props.nonProdEnv.account}:report-group/cloud-journey-simluation-*`,
    ],
})
```

## Reporter config.json

In the reporter config specify what reporters you will be using in the reporter enabled property.
I used mocha junit reporter and specified where I want my files to be saved. This will need to be unique so I used [hash] to give the file a unique hash value so that I can merge these for the code build report.

```json
{
  "reporterEnabled": "spec, mocha-junit-reporter",
  "mochaJunitReporterReporterOptions": {
    "mochaFile": "cypress/results/results-[hash].xml"
  }
}
```

## Cypress.json

In the cypress json specify the reporter config we set up above.

```json
"reporter": "cypress-multi-reporters",
 "reporterOptions": {
   "configFile": "reporter-config.json"
 }
```

## Package.json - in your cypress directory

In the package.json in your cypress directory set up the following script commands.
If the reports folder already exists then we want to remove everything in that folder before we run the E2E test.

```json
"scripts": {
   "test": "cypress run",
   "cypress:open": "cypress open",
   "delete:reports": "rm cypress/results/* || true",
   "prereport": "npm run delete:reports",
   "report": "cypress run --reporter cypress-multi-reporters --reporter-options configFile=reporter-config.json"
 }
```
