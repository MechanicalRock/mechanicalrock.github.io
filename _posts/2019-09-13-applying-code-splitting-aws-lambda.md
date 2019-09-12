---
layout: post
title:  "Applying Code-Splitting to AWS Lambda"
date:   2019-09-13
tags: typescript lambda webpack 
author: Matt Tyler
image: img/lambda.png
---

Serverless Hero Yan Cui recently posed the question ["Just how expensive is the full AWS SDK"](https://www.freecodecamp.org/news/just-how-expensive-is-the-full-aws-sdk-3713fed4fe70/)? Plenty of people are concerned about cold starts, so it makes sense to be concerned with how can we make our functions as lean as possible to ensure the smallest cold starts and the fastest executions possible. After all, time is money - especially when we are paying by the 100ms.

In Yan's article, he noted that you can cut down the time node spends importing a particular SDK client in a few ways. The easiest way is to import the specific client needed rather than the entire SDK. So instead of doing this;

```js
import { S3 } from "aws-sdk";
```

You would do this;

```js
import S3 from "aws-sdk/clients/s3";
```

Additionally, Yan showed that using a bundler (specifically webpack) improved execution times. Typically both optimizations resulted in a saving of around 100ms at cold start time. This saving only occurs at cold-start time because the imports are only resolved on the first invocation - if you attempted a dynamic import then this would likely incur a penalty on every invocation. For dependencies that are particularly large (like the AWS SDK), there was no discernable difference in execution between bundling and standard import. At any rate, it is easy to conclude that larger dependencies incur additional cost. It has been good advice for a long time to minimize dependencies, and that hasn't changed with AWS Lambda.

This did give me a thought though - code-splitting has been popular in the front-end world for some time as a means to optimize load-times of web applications. With code-splitting, front-end developers can build applications that lazy-load dependencies only when there is an immediate need. Users therefore don't have to wait to load every part of a web application if they only need to interact with a small part of it. Is it possible to use code-splitting in a serverless application? And is it practical to do so? Let's find out!

First - what would code-splitting even look like in a serverless application? I'd imagine a minimal example would be something like this:

```typescript
const handlers = new Map<string, () => void>();
const modules = new Map<string, string>();

// ...

const handler = (event) => {
    if (!modules.has(event)) {
        throw new Error("No module to available to handle event");
    }

    const module = modules[event];
    if (!handlers.has(module)) {
        handlers[module] = require(module);
    }

    handlers[module](event);
}
```

Now, I don't know whether this is even sensible. I'm sure you could find a use-case where this kind of optimization may be helpful, but I doubt it would be particularly common. You could certainly make the case that overloading the handler in this way would be violating seperation of concerns e.g. maybe you would be better off writing separate handler functions.

When I started thinking about this, I was looking at ways to write a serverless application that could delete resources that had failed to be cleaned up after running integration tests. In that scenario, I would need to import multiple different clients from the AWS SDK to handle different resource types - that said, I don't know which clients need to be imported until the handler executes. Let's step through this example.

Imagine a project structure like the following;

```
├── DeleteResources
│   ├── index.ts
│   ├── lib.ts
│   ├── resourcegroups
│   │   └── group.ts
│   ├── s3
│   │   └── bucket.ts
│   └── servicecatalog
│       └── cloudformationproduct.ts
```

In this case, the `index.ts` file contains the handler logic. It consumes entries from an SQS queue that contain the resource type and the resource ARN. The folder structure for the resources is deliberately designed to match the resource type records to make it easy to work out what file needs to be imported - e.g. `AWS::S3::Bucket` would map to the file in `s3/bucket`.

```typescript
import { SQSHandler, SQSRecord } from "aws-lambda";
import { Delete } from "./lib";

interface Payload {
    ResourceArn: string
    ResourceType: string
}

async function DeleteRecord (record: SQSRecord): Promise<void> {
    const { ResourceType, ResourceArn } = JSON.parse(record.body) as Payload;
    return await Delete(ResourceType, ResourceArn);
}

export const handler: SQSHandler = async (event) => {
    await Promise.all(event.Records.map(DeleteRecord));
}
```

The delete function in `./lib` is where the magic happens. As is turns out, you can take advantage of code-splitting functionality in webpack to do the heavy-lifting. It looks like so;

```typescript
export const Delete = async (type: string, arn: string): Promise<void> => {
    const [ _, service, resource ] = type.split("::").map(e => e.toLocaleLowerCase());
    const mod = await import(
        /* webpackInclude: /(s3|servicecatalog|resourcegroups)/ */
        /* webpackMode: "lazy-once" */
        `./${service}/${resource}`);

    await mod.default(arn);
}
```

In this case, I use a dynamic import statement with additional metadata to tell webpack how to handle the dynamic import. The `webpackInclude` statement tells webpack that I will only ever try to load files that match the following regex at runtime. The argument to the import statement already tells webpack that it needs to look for possible candidate files in the current directory. Finally, the `webpackMode` directive tells webpack that I want to lazy-load the module once on usage, and keep it cached in case the module needs to be resolved again.

A deletion handler for a particular resource-type then looks like this. Note that it only imports the client it requires, so that it doesn't need to load the whole aws-sdk package.

```typescript
import catalog from "aws-sdk/clients/servicecatalog";
import { SplitArn, Call } from "../lib";

const re = new RegExp(/^product\/(?<ProductId>.+)/);

export default async function DeleteServiceCatalogCloudFormationProduct(arn: string) {
    const { resource } = SplitArn(arn);
    const [ _, Id ] = re.exec(resource);
    // Here I have wrapped the API call to ignore deletion errors from 
    // resources that do not exist
    await Call(() => new catalog().deleteProduct({ Id }));
}
```

This does some take some additional configuring of webpack to get this all working. I had been using the default webpack configuration producted by Rich Buggy [here](https://github.com/SnappyTutorials/aws-sam-webpack-plugin), but found it caused the "split-code" to be output in the wrong location. This meant that it was failing to be uploaded to S3 correctly. I still use Rich's plugin, but I modified the configuration to use webpack in multi-compiler mode, and this fixed the issue. This was my final webpack configuration:

```js
const AwsSamPlugin = require("aws-sam-webpack-plugin");
const awsSamPlugin = new AwsSamPlugin();
const path = require("path");

module.exports = Object.entries(awsSamPlugin.entry()).map(([name, entry]) => {
  return {
    entry,
    output: {
      filename: "app.js",
      libraryTarget: "commonjs2",
      chunkFilename: "[id].js",
      path: path.join(__dirname, `/.aws-sam/build/${name}`)
    },
    devtool: false,
    resolve: {
      extensions: [".ts", ".js"]
    },
    target: "node",
    externals: [
      "aws-sdk", 
      /aws-sdk\/clients\/.*/
    ],
    mode: process.env.NODE_ENV || "production",
    optimization: {
      minimize: false
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: "babel-loader"
        }
      ]
    },
    plugins: [
      awsSamPlugin
    ]
  }
})
```

Executing a build command results in the following;
```
└── build
    ├── DeleteResources
    │   ├── 0.js
    │   ├── 1.js
    │   ├── 2.js
    │   └── app.js
```

The `app.js` file contains the entry point code, and each specific resource deletion function has been compiled into its own file identified by a digit. At runtime, the handler will dynamically import the code if it is required from the appropriate file. If the particular function is not required, it will never get resolved.

I don't expect that this will likely bring about massive cost savings, but it was an interesting experiment to see if it was possible to implement code-splitting and dynamic resolution of modules at runtime in AWS Lambda.

Struggling with serverless? We can help! Contact us to [get started!](https://www.mechanicalrock.io/lets-get-started)