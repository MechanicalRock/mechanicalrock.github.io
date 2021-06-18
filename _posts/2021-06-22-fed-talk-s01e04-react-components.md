---
layout: post
font: serif
title: "FED Talk! Episode 4: React Components"
description: "In today’s episode we talk all things Components, taking you from novice to pro!"
date: 2021-06-22
highlight: monokai
image: /img/fed-talk/s01e04/cover-ep4-740.png
author: Quintin Maseyk
tags: [react, react Components, Component composition]
---

![Front-End Development Talk: Episode 4 - React Components](/img/fed-talk/s01e04/cover-ep4-740.png)

In today's episode we will step through how to implement good React Components, covering:

* Component Fundamentals
* Component Composition
* Performance Considerations

**Let's get started!**

---

**Table of Contents:**

---

## Component Fundamentals

> :warning: React Components can be a sensitive topic, so if you get offended jump to the next chapter.

Components allow us to abstract logic and state away from the the view (DOM). Its existence enables us to think generically and build abstractions, thus, build repeatable testable bits of code.

**Long lived the days of re-defining a Button!**

The above statement resonates well with me and I hope it does with you too. Why should we waste our precious time re-writing static code when can do so much more with our talent.

This train of thought can outline the following rules when creating Components:
* Can it broken down any further? **If yes**, answer the below questions. **If no** and if it does not contain other Components then it is likely a UI Component (low level Component), note it as such and move on.
* Can it be reused anywhere else? **If yes**, make sure your Typed Interface is concrete, **if no**, can you normalize it's implementation to make it re-usable? **If not**, I call that a *bespoke Component*.
* Does it refer to another Component in a similar fashion? **If yes**, is there a way you can generalize the two without bloating the Interface? **If no**, it is likely a new Component.

From my experience Applications are made up with lots of the same Components with different `variants`. Variants is a convention which allow the Designer and Developer re-use the same generic implementation of a Component, while specifying a slightly different appeal at the same time. It's good practice to use Variants in your Components as to ultimately stop the bloating of your App and centralize change.

**Why does this really matter?**

I believe it comes down to producing quality software, faster.
If the argument is you can copy/paste similar code here and there, create bespoke components everywhere, get it working, dust your hands and move on; then maybe you are missing the point where in the event you have to iterate over the branding or content in a harmonious way it'll be difficult. In this case you'll spend more time nitpicking the changes, likely missing a something adjacent to what you recall.

:thumbsup: It's really not that hard to write good React Components, follow on to see.

---

## Component Composition

Component composition is the way in which we orchestrate the relationship between Components. For example, how we pass information from a Parent to a Child, or how to access Child references in the Parent. There are many ways to achieve this, so in this section we will go through the different options and compare them.

Ordered by complexity:

### UI Component (low-level element)
```tsx
function FancyButton({ label, onClick }) {
  return (
    <Button
      className={SomeFancyImplementation}
      onClick={onClick}
      variant="Outlined"
    >
      {label}
    </Button>
  )
}
```
In this case there is no composition. These would typically be small UI elements such as Typography, Button, Link, List, Table Cell, etc variants. Once defined the

### Parent Child Relationship
```tsx
function VotePanel() {
  const [vote, setVote] = React.useState();
  return (
    <div>
      <Typography variant="h3">How good is React!?</Typography>
      <FancyButton label="Vote: Good!" onClick={() => setVote('GOOD')} />
      <FancyButton label="Vote: Bad!" onClick={() => setVote('BAD')} />
    </div>
  )
}
```
In this case there is composition. In the `VotePanel` scope, we are mounting two `FancyButton` Components, thus composing them as children to the `VotePanel`.

### Children Prop
```tsx
function FancyButton({ children, onClick }) {
  return (
    <Button
      className={SomeFancyImplementation}
      onClick={onClick}
      variant="Outlined"
    >
      {children}
    </Button>
  )
}

function VotePanel() {
  const [vote, setVote] = React.useState();
  return (
    <div>
      <Typography variant="h3">How good is React!?</Typography>
      <FancyButton onClick={() => setVote('GOOD')}>Vote: Good!</FancyButton>
      <FancyButton onClick={() => setVote('BAD')}>Vote: Bad!</FancyButton>
    </div>
  )
}
```

This looks very similar to the first example, however we replaced the need to declare a new prop `label: string;` with React's `children` prop. The `children` prop is special in that it's available in every React Component out-the-box and it's Type (`ReactNode`) is most things:

```ts
type ReactText = string | number;
type ReactChild = ReactElement | ReactText;

interface ReactNodeArray extends Array<ReactNode> {}
type ReactFragment = {} | ReactNodeArray;
type ReactNode = ReactChild | ReactFragment | ReactPortal | boolean | null | undefined;
```

The value of `children` is everything between the Component's tags. In the above case "Vote: Good!" and "Vote: Bad!".

---

## Performance Considerations

It's good to understand how Components can affect your overall Application.
Every time you render a Component it gets attached to React's virtual DOM. React stores the virtual DOM in memory, it represents the UI and maintains all of the Applications State in something called "Fibers". Fibers hold additional information of each of the Components along side the tree and its main purpose is to reconcile changes and enable incremental rendering of the Virtual DOM.

> **Would you prefer to render an entire page or a small subset of the page?**
> *I know what I would prefer*

That's why it's good practice to break down Components into smaller chunks. When a change occurs in the tree the reconciliation process will identify what parts of the tree have made enough noise to warrant it to re-render.

---

## :pray: Closing

<!-- At this stage your application should be wrapped with a Router Component.
You should have enough knowledge on how to setup your Applications routes, link between pages and use Router hooks to access parameterized data.

You are now ready to move onto the next episode where I’ll be walking you through how to implement a good Component, covering the following topics:

* What makes a good Component, well, good?
* Component Composition
* Performance Considerations -->

[Previous Episode:<br/><strong>Material UI Theme</strong>](/2021/05/14/fed-talk-s01e02-theme-providers){: .btn.chevron.chevronLeft}

---

Don't be shy, [get in touch with us!](https://www.mechanicalrock.io/lets-get-started)

![Mechanical Rock Logo](/img/mr-logo-dark-landscape.jpg)
