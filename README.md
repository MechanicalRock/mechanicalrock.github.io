# mechanicalrock.github.io - Amazing Project

Welcome to our Blog!

[Published blogs](https://mechanicalrock.github.io/)

## How to create a Blog

* Create a branch, using the format: `article/summary-title`
* Add your post under `_posts` using the format: `yyyy-mm-dd-summary-title.markdown`
* View your post locally (see below)
* Create a pull request - once approved it will be live (if not post dated).

### Blog Props

```ts
---
layout: post | postv2
hidden: boolean // [Optional] If true, the blog will not appear in the list
font: serif // [Optional] Will transform your blog with Serif Font
title: String // (Recommended length 60 characters)
description: String // (Recommended length 150-160 characters)
date: Date
dateModified: Date // [Optional] Make sure to set this if you make updates to your post after the original Date
highlight: monokai // [Optional] Will apply the monokai dark highlight theme to each of your page's code blocks.
tags: String | String[] // (Recommend 5 tags). Make sure your tags are what people Google Search. Make sure your tags are also mentioned in your blog post itself.
author: String
image: String // Relevant path directory to your image (do not prefix with a /)
sitemap: Boolean // [Optional] By default articles are indexed in the sitemap.xml file. Setting this to false will remove it from the sitemap
---
```

References:

* [Creating and Hosting a Personal Site on GitHub](http://jmcglone.com/guides/github-pages/)
* [Syntax](https://kramdown.gettalong.org/syntax.html#code-spans)

## Authoring Content

Start the Jekyll container:

`docker-compose up blogserver`

Rebuilding the Jekyll container:

If the container fails to start by throwing errors, you may need to rebuild the container by running the following:

`docker-compose build blogserver && docker-compose run blogserver`

Browse to the page: [http://localhost:4000](http://localhost:4000)

<a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-sa/4.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution-ShareAlike 4.0 International License</a>.

