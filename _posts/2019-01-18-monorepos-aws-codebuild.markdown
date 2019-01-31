---
layout: post
title:  "Monorepos & AWS Codebuild"
date:   2020-08-27
tags: aws codepipeline codebuil npm node monorepo
author: Matt Tyler
---

TL;DR

- Mono-repos generally require specialized tooling to manage correctly when they begin to reach any appreciable size
- Lerna can be used to manage node mono-repos
- npm ci can be utilized to install packages based on a lock file, which signficantly speeds up the time it takes to install packages.
- Package installation can be sped up by persisting the local NPM package cache between build invocations
- Considered installing hefty development dependencies into the root of the mono-repo to reduce duplicating your dependencies across packages in the repository. Test runners (like Jest) are a good candidates for this.

This story began with a simple conundrum. A particular repository was taking a long time to build. The process at present was to trigger a build everytime a PR was raised, so tests could be run against the PR and confirm that the code was safe to merge. The repository however, kept becoming larger and additional checks were being added during CI to perform extra static analysis of the code. Whilst this was all well and good, nothing in life is free, and the entire development team was paying for this in the form of increased build-time. 

This has the consequence of increasing the amount of time a developer has to wait to receive a feedback. This generally encourages a number of negative behaviours that we would like to avoid; e.g. Avoiding writing tests, performing in work in increasingly larger batches - which increases the risk of failure, pushing directly to master to avoid checks, disabling checks etc. This creates an increasingly poor feedback loop, which decreases that quality of the code being released to end-users.

The first step towards improving this was to have a good look at how the repository was structured. The present state was reasonably large monorepo, almost entirely written in node/typescript. It consisted of a few node modules, some of which were nested within eath other. Additionaly there was some duplication of code between different modules. None of those modules were being published to either NPM or a privately hosted NPM repository. There were a few "service" modules that consisted of serverless projects that were deployed directly to AWS, and a few AWS CDK projects that generated cloudformation templates to be stored in an S3 bucket and instantiated on-demand.

Much has been written recently on the monorepo, both for and against. One thing that often isn't covered is how package management plays a role in what you might chose. This project, for instance, was located in an enterprise company that would both not want to publish code to the public NPM repository, and at present did not have a hosted package management solution like JFrog Artifactory or Sonatype Nexus. My personal experience is that not an uncommon situation within enterprise companies and smaller shops working with legacy tooling, or with developers with little open source experience. In the latter, its usually not too difficult to quickly deploy a hosted package management server. This can be a bit more difficult in larger organizations, as a business case needs to be carefully prepared and approved, and then it may take some for procurement and installation. When this occurs, not using a monorepo is a luxury that you can't afford. With this in mind, I began to look at how we could improve the existing monorepo and it's interactions with AWS Codebuild.

The first step was to introduce something to help us manage the monorepo. I had previously used 'lerna' to manage another node-based monorepo with some success. This began a reasonably lengthy task to restructure what he already had. This meant moving from a heavily nested module structure, to a more flattened structure - which is technically what would have happened had each module been seperated into its own repository. With this in-place, it was now a little easier to manage the dependencies of each module and enable a clear seperation of concerns. We were also using a feature in lerna called 'hoisting' which deduplicates dependencies that many packages may rely on.

Unfortunately, we had a small issue with hoisting which meant that we had to remove it. Hoisting involves installing packages in the base node_modules directory of the repository as opposed to the specific package - your 'child' packages thereby resolve all their dependencies at the base as opposed to their own node_modules folders. However, A few of our packages needed to bundle their dependencies, and this was unfortunately impossible to do with lerna's hoisting, because they would attempt to package their local node_modules folders which contained nothing. Had lerna's hoisting had the ability to be limited to development dependencies, this issue may have gone away. But alas, it did not, and therefore we needed to disable hoisting.

Despite the movement to lerna to better manage the repository, this meant that we still had to reckon with fairly large build times which were agitated by the removal of hoisting. It was at this point I started inspecting our build environment and actions to determine possible improvements. This involved learning a lot more as to how npm packaging, caching and installation works, and from this I was able to come up with a few things to try out.

The next improvement to be made was to use `npm ci`. This instructs npm to not resolve dependencies from directly from definitions in the package.json file, and instead use the package-lock.json file. Fundamentally, this instructs npm to install all packages called out in the lock file, rather than resolving everything from the top level dependencies. This provided a reasonably modest speed improvement (roughly ~20%), which is not bad for what was a minor one-line change.

Despite this, the installation time was still quite large - taking roughly as long to complete as it did to run our entire test suite. Which was quite odd, given that our test suite includes a fair amount of integration tests that poll external endpoints over the network. It was at this point I started investigating how we could cache our packages so they could potentially be installed faster.

Fortunately, code build does have the ability to cache assets between builds. To do so, you configure a build step with a reference to the items you want to cache (typically a directory) and provide a reference to an S3 location (where the cached items will be persisted). This does require that your package manager is caching any installed dependencies in some location - which fortunately later versions of npm do. With this configured, I expected that this would give a fair improvement in the time it would take to install my dependencies.

//// Add details of the set up here
//// Codebuild step showing how to configure the npm cache
//// The cloudformation required to specify the location of the cache

Unfortunately this is not what occurred and I got a barely noticeable improvement. This left me scratching my head for awhile. I had a look through the package cache on my local machine and noticed that the packages are stored as compressed archives (tar.gz) in the npm cache folder - If you attempt to install a package you have previously installed, it is installed from the cache by uncompressing the matching archive to the appropriate node_modules folder. At this point, I decided to look at how many dependencies a common (albeit complex) package had. I used the following website to get an idea of how many dependencies Jest had, which practically all our packages relied on. I was than treated to the illuminating fact that jest had a complete dependeny tree of around 900 packages. Eep. It was then I realised that our 'installation' time was not bound by the network time to fetch the packages remotely - it was the time to uncompress these dependencies to each directory.

There are two ways to improve this - better hardware, and a reduction in the number of times these dependencies to be installed. The former was achieved by bumping the size of the build environment. The latter was slightly more complex. We emulated the hoisting feature by moving development dependencies to top level package.json, and called out these dependencies as peer dependencies to serve as a reminder that they were required in the child packages. 

Some additional changes were needed to make Jest perform slightly better in this arrangement. Previously, we called jest seperately on each project, with each project having its own seperate jest configuration. We instead provided a global jest configuration at the base of the monorepo that was capable of locating and executing all tests across the entire repository. This does require that you name and locate tests based upon a convention, which fortunately we were doing.

At this point, we had solved the worst of our build time issues, resulting in a reduction from approximately 15 minutes down to 3 minutes for a complete build of the repository. 

There are still additional optimizations that can be made. We currently have a configuration to use Jest in multi-project mode, which when combined with lerna's 'changed' command, can be used to ensure we that only build and test packages in the repository that have changed. This would make our CI check run much faster for changes that only touch a few packages (which has the added effect of encouraging our developers to make many smaller changes as opposed to fewer larger ones).

Our configuration to use jest in multi-project mode looks like this -

///

With this, we can specify executing a particular group of projects with the following command -

///

If we combine this with lerna changed, we can now determine which packages have changed since we made any commits to master, and test only those packages. In our case - the following command can be issued.

///

/// Conclusion goes here
