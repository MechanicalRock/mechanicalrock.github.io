---
layout: post
title:  "Monorepos and AWS Codebuild"
date: 2019-02-03
tags: aws codepipeline codebuild npm node monorepo
author: Matt Tyler
image: img/hydra.gif
---

A Monorepo generally requires specialised tooling to manage efficiently once they reach an appreciable size. We recently have been working with a client that has a large node-based monorepo that was encountering increasingly larger build times. By introducing optimisations which included the use of lerna, newer npm features (ci installation, package caching) and de-duplicating development dependencies, we were able to achieve a 1000% speed improvement.

This story began with a simple conundrum. A particular repository was taking a long time to build. The process at present was to trigger a build every time a PR was raised, so tests could be run against the PR and confirm that the code was safe to merge. The repository however, kept becoming larger and additional checks were being added during CI to perform extra static analysis of the code. Whilst this was all well and good, nothing in life is free, and the entire development team was paying for this in the form of increased build-time. 

This has the consequence of increasing the amount of time a developer has to wait to receive feedback. This generally encourages a number of negative behaviours that we would like to avoid; e.g. Avoiding writing tests, performing in work in increasingly larger batches - which increases the risk of failure, pushing directly to master to avoid checks, disabling checks etc. This creates an increasingly poor feedback loop, which decreases the quality of the code being released to end-users.

The first step towards improving this was to have a good look at how the repository was structured. The present state was a reasonably large monorepo, almost entirely written in node/typescript. It consisted of several node modules, some of which were nested within each other. Additionally there was some duplication of code between different modules. None of the modules were being published to NPM or a privately hosted NPM repository. There were a few "service" modules that consisted of serverless projects that were deployed directly to AWS, and a few AWS CDK projects that generated cloudformation templates to be stored in an S3 bucket and instantiated on-demand.

Much has been written recently on the monorepo, both [for](https://medium.com/@adamhjk/monorepo-please-do-3657e08a4b70) and [against](https://medium.com/@mattklein123/monorepos-please-dont-e9a279be011b). One thing that often isn't covered is how package management plays a role in what you might choose. I live and work outside of the Silicon Valley bubble - working inside of companies with sub-optimal development processes is normal for me, and I would not be working there if everything was sunshine and rainbows. This project, for instance, was located in an enterprise company that neither wanted to publish code to the public NPM repository, nor had a hosted package management solution like JFrog Artifactory or Sonatype Nexus. In my personal experience this is not an uncommon situation within enterprise companies and smaller shops working with legacy tooling, or with developers with little open source experience. In the latter, it's usually not too difficult to quickly deploy a hosted package management server. This can be a bit more difficult in larger organisations, as a business case needs to be carefully prepared and approved, and then it may take some time for procurement and installation. When this occurs, not using a monorepo is a luxury that you can't afford. With this in mind, I began to look at how we could improve the existing monorepo and its interactions with AWS CodeBuild.

> ...in terms of collaboration and code sharing, at scale, developers are exposed to subsections of code through higher layer tooling. Whether the code is in a monorepo or polyrepo is irrelevant; the problem being solved is the same...  - Matt Klein, Engineer @ Lyft & Creator of [Envoy](https://www.envoyproxy.io/)

The first step was to introduce something to help us manage the monorepo. I had previously used 'lerna' to manage another node-based monorepo with some success. I commenced a reasonably lengthy task to restructure what we already had. This meant moving from a heavily nested module structure, to a more flattened structure - which is technically what would have happened had each module been separated into its own repository. With this in-place, it was now a little easier to manage the dependencies of each module and enable a clear separation of concerns. We were also using a feature in lerna called 'hoisting' which deduplicates dependencies that many packages may rely on.

Unfortunately, we had a small issue with hoisting which meant that we had to remove it. Hoisting involves installing packages in the base node_modules directory of the repository as opposed to the specific package - your 'child' packages thereby resolve all their dependencies at the base as opposed to their own node_modules folders. However, A few of our packages needed to bundle their dependencies, and this was unfortunately impossible to do with lerna's hoisting, because they would attempt to package their local node_modules folders which contained nothing. Had lerna's hoisting had the ability to be limited to development dependencies, this issue may have gone away. But alas, it did not, and therefore we needed to disable hoisting.

Despite the movement to lerna to better manage the repository, this meant that we still had to reckon with fairly large build times which were agitated by the removal of hoisting. It was at this point I started inspecting our build environment and actions to determine possible improvements. This involved learning a lot more as to how npm packaging, caching and installation works, and from this I was able to come up with a few things to try out.

The next improvement to be made was to use `npm ci`. This instructs npm to not resolve dependencies directly from definitions in the package.json file, and instead use the package-lock.json file. Fundamentally, this instructs npm to install all packages called out in the lock file, rather than resolving everything from the top level dependencies. This provided a reasonably modest speed improvement (roughly ~20%), which is not bad for what was a minor one-line change.

Despite this, the installation time was still quite large - taking roughly as long to complete as it did to run our entire test suite. Which was quite odd, given that our test suite includes a fair amount of integration tests that poll external endpoints over the network. It was at this point I started investigating how we could cache our packages so they could potentially be installed faster.

Fortunately, code build does have the ability to cache assets between builds. To do so, you configure a build step with a reference to the items you want to cache (typically a directory) and provide a reference to an S3 location (where the cached items will be persisted). This does require that your package manager is caching any installed dependencies in some location - which fortunately later versions of npm do.

Configuring a codebuild step to use a cache is relatively straight forward e.g.

```yaml
  CodeBuildProjectApplication:
    Type: 'AWS::CodeBuild::Project'
    DependsOn: CodeBuildRole
    Properties:
    # The cache setting is used to configure where our cached items will be stored
      Cache:
        Type: S3
        Location: !Join ['/', [!Ref ArtifactRepositoryBucket, 'cache']]
      Artifacts:
        Name: !Ref ArtifactFileName
        Location: !Ref ArtifactRepositoryBucket
        OverrideArtifactName: true
        Packaging: 'ZIP'
        Type: 'S3'
      Description: Build Application
      Environment:
        Type: linuxContainer
        ComputeType: BUILD_GENERAL1_SMALL
        Image: aws/codebuild/nodejs:8.11.0
      Name: !Ref 'AWS::StackName'
      ServiceRole: !GetAtt CodeBuildRole.Arn
      Source:
        BuildSpec: !Ref BuildSpecFileName
        Location: !Ref GitHubProjectURL
        GitCloneDepth: 0
        Type: 'GITHUB_ENTERPRISE'
      TimeoutInMinutes: 10
```

Once that is done, you need to actually specify what files constitute the cache in your buildspec file. AWS Codebuild will ensure that files in this location are cached between steps.

```yaml
version: 0.2
phases:
  install:
    commands:
      # npm configuration
      # here i configure npm to set the cache at /root/.npm
      - npm config -g set prefer-offline true
      - npm config -g set cache /root/.npm
      - npm config get cache

      - cd ${CODEBUILD_SRC_DIR}
      # perform a CI installation of base packages
      - npm ci

  pre_build:
    commands:
      # Clean entire monorepo and install dependent packages
      - ./node_modules/.bin/lerna bootstrap --ci --ignore-scripts --concurrency 4

  build:
    commands:
      # Build everything
      - ./node_modules/.bin/lerna run build --concurrency 4

  post_build:
    commands:
      # execute all the tests
      - NODE_OPTIONS="--max-old-space-size=4096" ./node_modules/.bin/jest --ci --config=jest.config.ci.js --coverage=true --no-cache --maxWorkers=4

artifacts:
  files:
    # include built artefacts


# At this step, we instruct codebuild to cache all items that in the NPM Cache
# that we configured earlier
cache:
  paths:
    - /root/.npm/**/*
```

With this configured, I expected that this would give a fair improvement in the time it would take to install my dependencies. Unfortunately this is not what occurred and I got a barely noticeable improvement. This left me scratching my head for awhile. I had a look through the package cache on my local machine and noticed that the packages are stored as compressed archives (tar.gz) in the npm cache folder - If you attempt to install a package you have previously installed, it is installed from the cache by uncompressing the matching archive to the appropriate node_modules folder. At this point, I decided to look at how many dependencies a common (albeit complex) package had. I used the following [website](https://npm.anvaka.com/) to get an idea of how many dependencies Jest had, which practically all our packages relied on. I was then treated to the illuminating fact that jest had a complete dependency tree of around 900 packages. Eep. It was then I realised that our 'installation' time was not bound by the network time to fetch the packages remotely - it was the time to uncompress these dependencies to each directory.

There are two ways to improve this - better hardware, and a reduction in the number of times these dependencies would installed. The former was achieved by bumping the size of the build environment. The latter was slightly more complex. We emulated the hoisting feature by moving development dependencies to top level package.json, and called out these dependencies as peer dependencies to serve as a reminder that they were required in the child packages. 

Some additional changes were needed to make Jest perform slightly better in this arrangement. Previously, we called jest separately on each project, with each project having its own separate jest configuration. We instead provided a global jest configuration at the base of the monorepo that was capable of locating and executing all tests across the entire repository. This does require that you name and locate tests based upon a convention, which fortunately we were doing.

> At this point, we had solved the worst of our build time issues, resulting in a reduction from approximately 20 minutes down to 3 minutes for a complete build of the repository. 

There is an additional optimisation that can be made. We added a configuration to use Jest in multi-project mode, which when combined with lerna's 'changed' command, can be used to ensure we that only build and test packages in the repository that have changed. This makes our CI check run much faster for changes that only touch a few packages (which has the added effect of encouraging our developers to make many smaller changes as opposed to fewer larger ones). We also removed ts-jest in favour of Jest 24's in-built support with babel 7.

Our configuration to use jest in multi-project mode looks like this -

```javascript
module.exports = {
    globals: {},
    // Each path in the array below uses the jest configuration
    // at that path for that particular 'project'.
    projects: [
        "<rootDir>/packages/package_one",
        "<rootDir>/packages/package_two",
        "<rootDir>/packages/package_three",
        "<rootDir>/packages/package_four",
    ],
    testEnvironment: "node",
    testPathIgnorePatterns: ["/lib/", "/node_modules/"],
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    coverageDirectory: "./.cover",
    collectCoverageFrom: ["**/src/**/*.{ts}", "!**/node_modules/**"],
    coverageThreshold: {
        "global": {
            "branches": 80,
            "functions": 80,
            "lines": 80,
            "statements": 80
        }
    }
};
```

With this, we can specify executing a particular group of projects with the following command -

```bash
./node_modules/.bin/jest --ci "/tests/.*\\.(test|spec|integration)?\\.(ts|tsx)$" --projects ./packages/package_one ./packages/package_two
```

If we combine this with lerna changed, we can now determine which packages have changed since we made any commits to master, and test only those packages. In our case - the following command can be issued.

```bash
./node_modules/.bin/jest --ci "/tests/.*\\.(test|spec|integration)?\\.(ts|tsx)$" --projects $(./node_modules/.bin/lerna list --all -p --since master | grep -Eo -e packages/.+)
```

This allows us to target execute tests against only packages which have changed. This does require you to perform a full checkout of the repository in AWS Codebuild, as opposed to the default behaviour which is to perform a shallow clone. 

> At this point, our build and test cycle typically executes in under 2 minutes for typical changes - or a 1000% improvement in execution speed.

I hope this gives everyone a good look at the steps that need to be taken to keep the build process of a monorepo running efficiently. In this case, it has included;

- Installing specialised tooling to manage a monorepo, in our case it was lerna.
- Taking advantage of dependency caching in AWS CodeBuild.
- Utilising npm ci to resolve and install dependencies.
- Running jest in multi-project mode together with lerna changed.

Hopefully this has been helpful for anyone who is looking at taking the Monorepo approach. 

Need help wrangling repositories, placating pipelines or boosting your builds? Get in touch at <contact@mechanicalrock.io>.
