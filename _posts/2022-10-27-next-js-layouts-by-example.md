---
layout: post
font: serif
title: Next.js 13 Layouts by Example
date: 2022-10-27
highlight: monokai
author: Tim Veletta
image: /img/blog/next-js-layouts-by-example/banner.jpg
tags: nextjs react
description: Let's look at how the new Layouts announced at Next.js Conf 2022 improve the developer experience of working with Next.js
---

Next.js has been a tool of choice here at Mechanical Rock for some time and so we were excited to see what [Vercel](https://vercel.com/), the makers of Next.js, would reveal at the second Next.js Conf just a day ago. One of my great frustrations with using Next.js in the past has been the implementation of **Layouts** particularly when it comes to nested routing.

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

Thankfully, at Next.js Conf, Vercel revealed a new file-based router build on top of [React Server Components](https://beta.nextjs.org/docs/rendering/server-and-client-components#) to enable first class support for **layouts**, **nested routing**, **loading states** and more which I’d like to dive into a bit more detail below.

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
// /app/layout.tsx
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

## Adding a Nested Layout

So far, we haven’t done much different from Next.js 12 and earlier but now the really cool new stuff starts with creating our `/app/games/layout.tsx` component. As mentioned earlier, any components within the `/app` folder are React Server Components by default which allows us to define our component as `async` such that it will fetch the data for the component on the server before sending static HTML to the user.

This allows us to create relatively clean components without having to use `useEffect` to manage the asynchronous communication with the server as we would currently, resulting in the component below.

```jsx
// /app/games/layout.tsx
async function getGames() {
 const res = await fetch('http://localhost:3000/api/games');
 return res.json();
}

export default async function Layout({
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

From here we can define our page files in both `/app/games/page.tsx` and also `/app/games/[id]/page.tsx` which will be rendered next to the list of games that we fetched in the component above. Also, thanks to `Suspense` being added in React 18, this component will not render until it has received the data it needs to render. This will currently block the transition to the games page until the content has been rendered on the server so it makes sense for us to define a fallback component while the content is loading which can be done with a `loading.tsx` file.

### Loading States

You can define a loading state at any level of your app and it will apply to any components further down the file tree. In this case we include a very simple loading component at the root of the app which will apply to all the other components that get created.

```jsx
// /app/loading.tsx
export default function Loading() {
 return <p>Loading...</p>;
}
```

To further exercise how loading states are selected, here's another example of a loading state that is defined at the `/app/games/` level which will only be selected in or below this route.

```jsx
// /app/games/loading.tsx
export default function LoadingGames() {
 return <p>Loading Games...</p>;
}
```

___Pretty cool right?___

## Mixing in Client Components

While we are focusing on user experience, it makes sense to highlight to the user which page they are on in our navigation bar which requires the app to have some information about what is going on in the client. Components within the `/app` folder are by default React Server Components but we can easily change them to client components by adding a `'use client';` statement at the top of our file.

We could make the entire root layout component a client component but that would mean the rest of our component tree would have to be client components since a server component can only import other server components. Thus, it makes sense to create a wrapper around the `Link` component and import that into our root layout. In this component we will use a new hook from `next/navigation` called `useSelectedLayoutSegment` that tells us which URL segment we are currently on.

```jsx
// /app/NavLink.tsx
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

We can then replace any instances of `Link` in our root layout with our newly created `NavLink` and still get the benefits of server components throughout our application.

If you’d like to find out more about the new Next.js Layouts check out this [documentation page](https://beta.nextjs.org/docs/routing/pages-and-layouts) or check out the talk by [Sam Selikoff at Next.js Conf](https://youtu.be/6mQ3M1CUGnk) which a majority of this example is based on.

[Mechanical Rock](https://www.mechanicalrock.io) can help you write performant, secure and beautiful web applications at the bleeding edge. If this is something that interests you, please [get in touch with us!](https://www.mechanicalrock.io/lets-get-started)

> Header image by <a href="https://unsplash.com/@sigmund?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Sigmund</a> on <a href="https://unsplash.com/s/photos/layout?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
