---
layout: post
font: serif
title: Next.js 13 Layouts by Example
date: 2022-10-27
highlight: monokai
author: Tim Veletta
# image: /img/blog/azure-ad-cypress/banner.jpg // TODO
tags: nextjs react
---

Next.js has been a tool of choice here at Mechanical Rock for some time and so we were excited to see what Vercel, the makers of Next.js, would reveal at the second NextConf just a day ago. One of my great frustrations with using Next.js in the past has been the implementation of **Layouts** particularly when it comes to nested routing.

Until now, our solution for nested routing and layouts has been to inspect the `router.pathname` to figure out which components to render which then couples our layout to our URLs which makes it difficult to make changes down the track if we decide to change those URLs.

```jsx
// /pages/_app_.js
import React from 'react'
import App from 'next/app'****
import DashboardLayout from '../components/DashboardLayout'

class MyApp extends App {
  render() {
    const { Component, pageProps, router } = this.props

    if (router.pathname.startsWith('/dashboard/')) {
      return (
          <DashboardLayout>
            <Component {...pageProps}></Component>
          </DashboardLayout>
      )
    }

    return (
        <Component {...pageProps}></Component>
    )
  }
}

export default MyApp
```

> If you want to read more about (previous) issues and how to solve them with Next.js layouts check out [this post by Adam Wathan](https://adamwathan.me/2019/10/17/persistent-layout-patterns-in-nextjs/)

Thankfully, at NextConf, Vercel revealed a new file-based router build on top of [React Server Components](https://beta.nextjs.org/docs/rendering/server-and-client-components#) to enable first class support for **layouts**, **nested routing**, **loading states** and more which I’d like to dive into a bit more detail below.

One of the big changes that you will notice coming from Next.js 12 and earlier is the addition of the `/app` folder which is similar to the `/pages` folder however components within `/app` are React Server Components by default.

![route segments.png](img/blog/next-js-layouts-by-example/route_segments.png)

Within the `/app` folder we are going to create several **route segments** with each segment mapped to a URL path. Within those folders, Next.js provides a set of special files which include:

- **page.tsx** is used to define the UI of a route.
- **layout.tsx** is used to define a UI that is shared across multiple pages. This is what we use to nest layouts creating nested routes.
- **loading.tsx** is used to define the loading UI for a specific part of the app.

With this in mind, we are going to look at an example which makes use of **nested layouts** to create **nested routes** based on the wireframe below. We are going to create a **root layout** that contains the navigation bar and another layout that shows a list of games the user can click to get more information about them.

> Check out the [example repository on Github here](https://github.com/MechanicalRock/next-layout-example)

![layout.png](img/blog/next-js-layouts-by-example/layout.png)

## The Root Layout

When you create a new Next.js project with the `/app` folder; it will automatically create a `RootLayout` for you. Within this we are simply going to add a header and navbar with a couple of links to other pages.

```jsx
import Link from 'next/link';

export default function RootLayout({
	children,
}: {
	children: React.ReactNode,
}) {
	return (
		<html lang="en">
			<head>
				<title>Next Layout Example</title>
			</head>
			<body>
				<header>
					<nav>
						<Link href="/">Home</Link>
						<Link href="/games">Games</Link>
					</nav>
				</header>
				<div>{children}</div>
			</body>
		</html>
	);
}
```

## The Games Layout

So far, we haven’t done much different from Next.js 12 and earlier but now the really cool new stuff starts with creating our `/app/games/layout.tsx` component. As mentioned earlier, any components within the `/app` folder are React Server Components by default which allows us to define our component as `async` such that it will fetch the data for the component on the server before sending static HTML to the user.

This allows us to create relatively clean components without having to use `useEffect` to manage the asynchronous communication with the server as we would currently resulting in the component below.

```jsx
async function getGames() {
	let res = await fetch('http://localhost:3000/api/games');
	return res.json();
}

export default async function Page({
	children,
}: {
	children: React.ReactNode,
}) {
	const games = await getGames();

	return (
		<div>
			<ul>
				{games.map((game: Game) => (
					<li key={game.id}>
						<Link href={`/games/${game.id}`}>{game.name}</Link>
					</li>
				))}
			</ul>
			{children}
		</div>
	);
}
```

// TODO talk more about the pages that go in here

## Mixing in Client Components

Even though components in the `/app` folder are by default React Server Components we’ll often need to change them to Client Components. We can do this by putting the statement `'use client';` at the top of our file.

// TODO talk more about the component

```jsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';

export default function NavLink({
	href,
	children,
}: {
	href: string,
	children: React.ReactNode,
}) {
	const segment = useSelectedLayoutSegment();

	const active = `/${segment}` === href;

	return (
		<Link className={active ? 'underline' : ''} href={href}>
			{children}
		</Link>
	);
}
```

If you’d like to find out more about the new Next.js Layouts check out this [documentation page](https://beta.nextjs.org/docs/routing/pages-and-layouts) or check out the talk by [Sam Selikoff at NextConf](https://youtu.be/pC2dl8hNVGg?t=1222).
