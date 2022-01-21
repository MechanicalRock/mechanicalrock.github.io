---
layout: post
title: Publishing TypeScript Node Modules
date: 2022-01-19
tags: typescript
author: Tim Veletta
description:
---

We are huge fans of TypeScript here at Mechanical Rock; the typing system and compilation allows us to catch possible errors at compile time, it allows us to refactor with confidence and the editor integration enhances developer productivity. Occasionally, we run into situations where we might want to build a common set of components that can be shared across several applications or even having multiple teams working on separate parts of an application in isolation from one another.

In cases like these, it helps to build your own TypeScript modules that can be managed through NPM. In this article I'm going to guide you through creating a new TypeScript module that allows you to share a Material UI theme across multiple applications and publishing it to a package registry.

# Getting Started

Firstly, lets create a new project by creating an empty directory and running `npm init -y` (the `-y` automatically accepts all options) which produces a `package.json` that looks like this:

```json
{
	"name": "theme",
	"version": "1.0.0",
	"description": "",
	"main": "index.js",
	"scripts": {
		"test": "echo \"Error: no test specified\" && exit 1"
	},
	"keywords": [],
	"author": "",
	"license": "ISC"
}
```

Next install TypeScript and the Material UI library as development dependencies with the command:

```
npm install typescript @mui/material --save-dev
```

Once we have TypeScript installed, we can initialise it with `npx tsc init` which will create a default `tsconfig.json` file which is used to help configure TypeScript. The reason we use `npx` to run the TypeScript compiler (`tsc`) is because it will look for the command in the locally installed dependencies rather than trying to use a globally installed version which would potentially cause version mismatch issues.

> If you ever need to find out what each of the configuration options means you can use this [handy guide](https://www.typescriptlang.org/tsconfig).

Now we are going to start building our custom theme, start by creating a `src` directory in the root of your project and within that we are going to create an `index.ts` file. In this file we'll initialise the Material UI theme and set the primary and secondary colours which will be shared among projects using this theme.

> You can find out more about the [Material UI theming options here](https://mui.com/customization/theming/)

```js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
	palette: {
		primary: {
			main: '#40bfb4',
		},
		secondary: {
			main: '#e15554',
		},
	},
});

export default theme;
```

Add `build: tsc` command to `package.json` in the `scripts` block:

```json
"scripts": {
    "build": "tsc",
    "test": "echo \"Error: no test specified\" && exit 1"
}
```

Within our `tsconfig.json` add the following options in the `compilerOptions` block.

```json
"outDir": "./dist",
"declaration": true
```

You should see the `dist` directory with the compiled code. Notice that it includes references to `@mui/material/styles`, but how do we ensure that projects installing our library have `@mui/material` installed? Thats where `peerDependencies` comes in, explain what peerDependencies are.

By adding a package in peerDependencies you are saying:

    My code is compatible with this version of the package.
    If this package already exists in node_modules, do nothing.
    If this package doesn’t already exist in the node_modules directory or it is the wrong version, don’t add it. But, show a warning to the user that it wasn’t found.

Have to manually add peer dependencies

```json
"peerDependencies": {
    "@mui/material": "^5.0.0",
    "@emotion/styled": "^11.3.0"
},
```

Have to add `@emotion/styled` since its an optional dependency of `@mui/material` but its required for theme generation.

# Publishing to a Registry

Preparing to publish, add to `package.json`, change the name to something unique.

```json
"main": "dist/index.js",
"types": "dist/index.d.ts",
"files": [
    "/dist"
],
```

You might also want to add `"prepublishOnly": "npm run build",` to your `scripts`

If you try to run `npm publish` now you'll get a message saying

```sh
npm ERR! code ENEEDAUTH
npm ERR! need auth This command requires you to be logged in.
npm ERR! need auth You need to authorize this machine using `npm adduser`
```

So lets go through and run `npm adduser`, you will need to sign up for an account at https://www.npmjs.com/signup

Then run `npm publish`

should get the output

```sh
npm notice
npm notice 📦  tim-veletta-theme@1.0.0
npm notice === Tarball Contents ===
npm notice 81B  dist/index.d.ts
npm notice 340B dist/index.js
npm notice 489B package.json
npm notice === Tarball Details ===
npm notice name:          tim-veletta-theme
npm notice version:       1.0.0
npm notice filename:      tim-veletta-theme-1.0.0.tgz
npm notice package size:  616 B
npm notice unpacked size: 910 B
npm notice shasum:        8d6517abb56fab745484a03e99b8351eb9137c19
npm notice integrity:     sha512-gWgTDeJqBEfkd[...]IJ0aRjxpWnPDg==
npm notice total files:   3
npm notice
+ tim-veletta-theme@1.0.0
```

# Using the Package

`npm install tim-veletta-theme`

Can test it out with:

```js
const theme = require('tim-veletta-theme');

console.log(theme.default.palette.primary.main);
```

Which when run should output #40bfb4 to the command line.
