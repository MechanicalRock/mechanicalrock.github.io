---
layout: post
font: serif
title: Private NPM modules with GitHub packages
date: 2022-04-04
tags: ['typescript', 'npm', 'node', 'github']
author: Tim Veletta
highlight: monokai
image: /img/typescript-npm-modules/header2.jpg
description: Now that we've built our own NPM module, lets dive into making it private to our organisation using GitHub packages to host it.
---

This is following on from my post on [Publishing Typescript NPM Modules](https://mechanicalrock.github.io/2022/01/24/publishing-typescript-npm-modules.html) where we created our own module and pushed it to the public NPM registry. However, we often run into cases where either ourselves or our clients don't want the modules we develop to be available publicly via the NPM registry.

In such cases we can use a private registry to host our modules and only make them available to people within the organisation. In this post I'll look into making the module we created in the previous post, `tim-veletta-theme`, a private one as well as talking about package scoping which makes things easier for the consumers of our package.

## Package Scoping

Before diving into creating a private package, we first have to look at package scoping. If you've been working with `npm` for some time now, you will no doubt have come across packages that begin with an `@` symbol. One such example used in the previous post was `@mui/material`; where the scope is `@mui` and the package is `material`.

The reason for using scopes is because package names must be unique, there is already a package out there called `material` so how do you distinguish between that and the one prodced by MUI?

Scoping also provide another avenue for developers to trust the source of the packages they're using in their projects. If you are already used to using packages from `@mui`, `@aws` or `@google` etc. you know you can trust the source of other packages within the same scope.

One thing to keep in mind is that if you are building a private package, it must be scoped.

## Making a Private Package

The first step in making a package private is having a package repository that allows for private packages. To publish a private package to NPM, your scope needs to match either your username on NPM or that of an organisation you belong to. You also need to be a paid user of NPM.

GitHub packages is another option which allows for free publishing of private packages but has a storage and data transfer limit which changes based on what level of account you have. This is the method that I will detail below however there is no reason why you can't use NPM or even something like Artifactory, CodeArtifact or anything else because its what is convenient to your organisation.

The first step in creating a private package on GitHub is authenticating with the packages API which is done using a personal access token (PAT). You can do so by following [the steps here](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) ensuring that you have the `write:packages` permission enabled on the token.

Once you have obtained your PAT, open up your `~/.npmrc` file and add the following line:

```sh
//npm.pkg.github.com/:_authToken=TOKEN
```

From here, you'll need to run:

```sh
npm login --registry=https://npm.pkg.github.com
```

Which will ask you for your GitHub username, password and email address. **Note that the password here is not the password that you use to login to GitHub but instead the PAT that you created above.**

Now that we are logged in, we need to make a few changes to our `package.json` file to include the package scope as well as update the publish configuration to tell NPM where to publish the package.

Note that the package scope **must be either your GitHub username or an organisation that you belong to**. In my case, the package scope can either be `@timveletta` or `@mechanicalrock`. I went ahead and made the following changes to my `package.json`:

```json
"name": "@mechanicalrock/tim-veletta-theme",
"publishConfig": {
  "registry": "https://npm.pkg.github.com"
},
```

From here I can simply run `npm publish` to publish the package to GitHub. The package will show up on repository homepage on GitHub as well as the organisation packages page.

![The GitHub package page]({{ site.url }}/img/typescript-npm-modules/github-package.png)

**To ensure the package is private, you will also need to make the repository private.** If however, you want to keep the repository private but make the package publicly available, you can change the privacy in the package settings.

## Consuming a Private Package

To consume the private package, you first need to be a part of the organisation the package belongs to on GitHub. You will need to [generate your own personal access token (PAT)](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) ensuring you have the `read:packages` permission; adding it to your `~/.npmrc` file as above.

```sh
//npm.pkg.github.com/:_authToken=TOKEN
```

Whilst editing this file, add the following line to tell NPM where to download your package from.

```sh
@mechanicalrock:registry=https://npm.pkg.github.com
```

Finally, it is simply a case of installing the package.

```sh
npm install @mechanicalrock/tim-veletta-theme
```

If you have any questions or if you think we can help speed up your delivery through the use of reusable modules, please don't hesitate to [get in touch](https://www.mechanicalrock.io/lets-get-started/)

> Header image by [Petrebels](https://unsplash.com/@petrebels?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/package?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)
