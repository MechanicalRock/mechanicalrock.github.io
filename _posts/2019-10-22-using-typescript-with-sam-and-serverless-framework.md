---
layout: post
title:  "Using Typescript with SAM & Serverless Framework"
date: 2019-10-22
tags: aws lambda typescript sam serverless 
author: Matt Tyler
image: img/lambda.png
---

Making it easy to deploy code to AWS is a major focus of most serverless frameworks. Python and Javascript tend to be well supported in this regard, and more or less work right out of the box. Handling dependencies, like those installed via package.json, and languages that compile down to javascript (like typescript), can be tricky at times.

Typescript throws a few spanners into the process. Typescript requires an extra compilation step and many tutorials out there don't include such a step so it is not entirely clear where and how to insert it in the process. More steps are required to enable local debugging though source-maps, which again complicates the process for beginners.

My gold standard for typescript compatibility would include the following things:

1. The source code for each lambda function is packaged individually.

    Each package of lambda function code should only include itself. This keeps bundles smaller and reduces the chance that an exploit could load and execute code from other functions.

2. The transpiled source code is modified as little as possible.

    I like having the option to view the source code in the lambda console. This can be a little annoying if it includes injected code included by a bundler like webpack.

3. Each functions zip file includes only the dependencies that are actually used at runtime.

    Again this keeps the size of package smaller and reduces the surface area of an attack.

4. Compatibility with the VSCode debugger.

   I don't actually use the debugger much myself but it can be helpful in a pinch. I know plenty of developers that use it often, so I like to include it.

Most out-of-the-box typescript project templates fail on one or more of the these points, and I've yet to actually to accomplish it myself because I often compromise on point 2. This is because in most circumstances I utilise webpack which injects additional support code in order to attain points 1 and 3, which I consider more important.

Which raises the question: What do my project configurations typically look like and why? Lets go over my configuration for both Serverless Framework and SAM powered projects.

## Serverless Framework

Lets review the most important files in my configuration. These would be the following files: serverless.yml, webpack.config.js, tsconfig.json and jest.config.js.

My serverless.yaml typically looks as follows:

```yaml
service: my-service

# you can add packaging information here
package:
  excludeDevDependencies: true
  individually: true

custom:
  webpack:
    webpackConfig: 'webpack.config.js'
    includeModules:
      forceExclude:
        - aws-sdk
    packager: npm
    packagerOptions:
      scripts:
        - rm -rf node_modules/aws-sdk

provider:
  name: aws
  runtime: nodejs10.x
  deploymentBucket:
    name: my-deployment-bucket
    serverSideEncryption: AES256

functions:
  MyFunction:
    handler: src/MyFunction.handler

        
plugins:
  - serverless-webpack
```

Firstly, I use `serverless-webpack` for most of my serverless projects. This enables me to build my code, and package dependencies how I want. Most of the time I configure it to force exclude the aws-sdk so it is never included in the final bundle. This unfortunately won't exclude the aws-sdk if another dependency includes it, so I usually include a script to remove the aws-sdk from the final bundle in case it has been included transitively. Additionally, I always configure functions to be packaged individually, and to exclude development dependencies.

This is a good point to take a look at my typical webpack configuration.

```js
const path = require('path');
const slsw = require('serverless-webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const nodeExternals = require('webpack-node-externals')

const entries = {};

Object.keys(slsw.lib.entries).forEach(
  key => (entries[key] = ['./source-map-install.js', slsw.lib.entries[key]])
);

module.exports = {
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  entry: slsw.lib.entries,
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },
  externals: [nodeExternals()],
  target: 'node',
  optimization: {
    // We no not want to minimize our code.
    minimize: false
  },
  module: {
    rules: [
      { 
        test: /\.tsx?$/, 
        exclude: /node_modules/, 
        loader: 'babel-loader',
        options: {
          plugins: [
            "@babel/plugin-proposal-async-generator-functions",
            "@babel/proposal-class-properties",
            "transform-modern-regexp"
          ],
          presets: [
              [
                  "@babel/preset-env", {
                      useBuiltIns: "usage",
                      corejs: "2",
                      shippedProposals: true,
                      targets: {
                          node: "current",
                      },
                      modules: "commonjs",
                  },
              ],
              "@babel/typescript",
          ]
        }
      },
    ],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin()
  ]
};
```

I'll focus on the most important parts. I include `serverless-webpack` because it exposes properties and functions that make it easy to set up webpack entry points. I also use `webpack-node-externals` as a convenient way to tell webpack not to bundle any of my dependencies. Notably, I use babel-loader instead of ts-loader. I have good reasons for this.

I use to exclusively use `ts-loader` but ran into memory issues with projects that had more than five functions. My work-around for this issue is to turn type-checking off and instead use `ForkTsCheckerWebpackPlugin` to perform type-checking at build time. I had jest configured in a similar manner using the jest typescript loader, and once again had memory issues there as the project got larger. Jest 24 was released around the same time and had in-built support for babel. After learning that babel had support for compiling typescript, I decided to take the opportunity to get rid of my dependencies on the typescript loaders.

Replacing the ts-loaders with babel got rid of all my memory issues, and gave a fairly significant performance boost. The reason for this is simple; babel doesn't actually compile typescript, it only strips out type annotations at build time. This does mean that there are certain typescript-only features (like namespaces) that you cannot use; but I haven't been affected by these limitations, so it is the right trade-off for me. 

Even though I technically do not use the typescript compiler to build code, I still install the typescript compiler to perform type-checking through my IDE. The only issue I have found here is that it does not catch issues with features that the typescript compiler supports, that I have not enabled the appropriate babel plugin for. This can occasionally get a little confusing in the IDE; as my IDE will sometimes indicate potential compilation errors that don't exist. 

Because of that my tsconfig.json file is usually small and uninteresting.

```json
{
    "compilerOptions": {
      "target": "esnext",
      "module": "commonjs",
      "allowJs": true,
      "checkJs": true,
      "sourceMap": true,
      "esModuleInterop": true
    },
    "include": ["src/**/*.ts", "src/**/*.js"]
}
```

My jest configuration is similarly succint, because most of the heavy lifiting is being done by babel.

```js
module.exports = {
    globals: {},
    testEnvironment: "node",
    testRegex: "/tests/.*\.(test|integration|accept)\.(ts|tsx)$",
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    coverageDirectory: "./.cover",
};
```

## SAM

My configuration for SAM is similar to what I use for the serverless framework. Obviously there is no `serverless.yml` file this time, so I'll jump straight to my webpack configuration.

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
      path: path.join(__dirname, `/.aws-sam/build/${name}`)
    },
    devtool: false,
    resolve: {
      extensions: [".ts", ".js"]
    },
    target: "node",
    externals: [ "aws-sdk" ],
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

I use the `aws-sam-webpack-plugin` that is provided by Rich Buggy. Where I differ from Rich's configuration is the use of webpack's multi-compiler support and the use of babel. 

I do this because I have been experimenting with code splitting features in a webpack, and it is impossible to do this in the standard configuration. I'll cover this in a future post.

My other configuration files don't vary from their serverless framework counterparts, though I typically keep the babel configuration out of the webpack configuration and in a separate `babel.config.js` file.

## Debugging

The process to configure typescript to work with the Typescript debugger is fairly obtuse, so many developers don't bother to do it. Many developers instead litter their code with logging statements.

I usually set up debugging to work correctly with Jest, so I can debug my tests. I'm less concerned with setting up breakpoint debugging on invocations triggered via serverless frameworks or SAM. I figure that if my code is at the point where I need to use a debugger, I better have a test for that path. In that sense, the debugger capability is a reward for doing the right thing and writing a test.

So how we do set up the VS Code debugger to work with jest in a typescript project? I place the following configuration in `.vscode/launch.json`;

```js
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "Debug (Test)",
            "cwd":"${workspaceFolder}",
            "runtimeExecutable": "node",
            "args": [
                "${workspaceRoot}/node_modules/.bin/jest",
                "--runInBand",
                "--no-cache"
            ],
            "runtimeArgs": [
                "--inspect-brk",
                "--harmony",
            ],
        }
    ]
}
```

Most of the issues I see with debug configurations occur from not including the correct arguments to args (which tell node what to run) and runtimeArgs (which are flags provided to configure node).

This allows me to debug my tests, but it does require executing a full test run. Usually when I'm debugging a test I only want to execute the one under inspection. You can get around this by providing additional arguments to the launch configuration, or focusing the particular test (e.g. s/it/fit) but it can be annoying having to edit the code everytime you want to focus on the test.

Although it is in beta, I've found the [Jest Test Explorer](https://marketplace.visualstudio.com/items?itemName=rtbenfield.vscode-jest-test-adapter) to best fit this kind of selective debug/execution flow, but your mileage may vary.

Hopefully this has given you some ideas on how to configure typescript with your serverless projects. It really isn't too scary, but it is difficult to work out given the variation in project configurations that can be found on the internet. With a bit of effort, you can get the advantages of typescript, while still having access to a fast compilation time and a reasonably good debugging experience.

Having troubles with typescript? Dilemmas with debugging? [Feel free to reach out!](https://twitter.com/mechanicalrock_)
