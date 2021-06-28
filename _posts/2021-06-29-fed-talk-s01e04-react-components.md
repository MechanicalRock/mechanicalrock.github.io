---
layout: post
font: serif
title: "FED Talk! Episode 4: React Components"
description: "In today’s episode we talk all things React Components, taking you from novice to pro!"
date: 2021-06-29
highlight: monokai
image: /img/fed-talk/s01e04/cover-ep4-740.png
author: Quintin Maseyk
tags: [react, react Components, Component composition]
---

![Front-End Development Talk: Episode 4 - React Components](/img/fed-talk/s01e04/cover-ep4-740.png)

In today's episode we will step through how to implement good React Components, covering:

* Component Fundamentals
* Component Hooks
* Component Composition

**Let's get started!**

---

**Table of Contents:**

- [Component Fundamentals](#component-fundamentals)
- [Component Lifecycle](#component-lifecycle)
  * [Component Mount Phase](#component-mount-phase)
  * [Component Un-Mount Phase](#component-un-mount-phase)
- [Component Hooks](#component-hooks)
  * [useEffect](#useeffect)
  * [useCallback](#usecallback)
  * [useMemo](#usememo)
    + [Scenario 1: Expensive Computations](#scenario-1-expensive-computations)
    + [Scenario 2: Expensive Renders](#scenario-2-expensive-renders)
    + [Scenario 3: Prop Drilling Madness](#scenario-3-prop-drilling-madness)
- [Component Composition](#component-composition)
  * [UI Component (low-level element)](#ui-component-low-level-element)
  * [Parent Child Relationship](#parent-child-relationship)
  * [Children Prop](#children-prop)
- [:pray: Closing](#pray-closing)

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

## Component Lifecycle

**Back in the day** when hooks and functional components didn't exist, its implementation was quite heavy in the sense where you had to specify its Class construct, on mount/un-mount events, if it should update the component or derive state updates upon prop changes and so on. The more you wrote these components the more you would complain how boiler-plate the majority of it is.

**Today** we have hooks and true functional components where it's intent is to allow us to focus on writing smaller bits of code, thus promoting React's component fundamentals. The obvious trade off is switching from `Class` implementation to `function() {} | const functionName () => {}` implementations; ultimately removing a lot of the boilerplate. Though with every abstraction hints a sense of magic under the hood. This section will cover what's actually happening when you create and mount your Functional Component.

Believe it or not, Functional Components still have a lifecycle. Lets create a basic component and track lifecycle.

```tsx
function NameField() {
  console.log('Before Render')
  return (
    <input type="text" value="" placeholder="Enter your name" />
  )
}

```

When you render `NameField` the first thing React will do is Compute any logic prior to the `return` block, then return. I like to categorize this in two areas:

1. **Computations**: all the things React need to do prior to responding,
2. **Response**: the response after each computation

Order of events:
1. `Before Render` will be logged
2. `<input />` field would render

### Component Mount Phase

There will come a time where you need to trigger some logic once upon mounting the Component. A typical use case for this might be fetching data when the component loads.

This is where the `useEffect` hook comes into play.

> The Effect Hook, useEffect, adds the ability to perform side effects from a function component. It serves the same purpose as componentDidMount, componentDidUpdate, and componentWillUnmount in React classes, but unified into a single API.

```tsx
function NameField() {
  React.useEffect(() => {
    console.log("On Mount")
  }, [])

  console.log('Before Render')
  return (
    <input type="text" value="" placeholder="Enter your name" />
  )
}
```

**Note**, for the component's mount phase to be triggered once, its most important for the dependency array to be empty as React treats this use case in a special by, where by it will ensure it only gets invoked once for the lifetime of the component being mounted.

Order of events:
1. `Before Render` will be logged
2. `<input />` field would render
3. `On Mount` will be logged

Lets explore what will happen if your component's mount phase cause a side effect.

```tsx
function NameField() {
  const [currentState, setCurrentState] = React.useState("beforeMounted");
  React.useEffect(() => {
    console.log("On Mount");
    setCurrentState("mounted");
  }, [])

  console.log("Before Render: ", currentState)
  return (
    <input type="text" value="" placeholder="Enter your name" />
  )
}
```

Order of events:
1. `Before Render: beforeMounted` will be logged
2. `<input />` field would render
3. `On Mount` will be logged
4. Component State gets updated
5. `Before Render: mounted` will be logged
6. `<input />` field re-renders

### Component Un-Mount Phase

Like the Component Mount phase, React conveniently offers an Un-Mount phase which you can piggy-back from the the Mount implementation. This hook is underrated and sometimes forgotten. Its purpose is to cleanup any of the components external factors prior to React un-mounting the component from its tree. A typical use case would be to abort asynchronous operations, or to alter application state etc.

Lets take a look what this looks like:

```tsx
function NameField() {
  const [currentState, setCurrentState] = React.useState("beforeMounted");
  React.useEffect(() => {
    console.log("On Mount")
    setCurrentState("mounted");

    return () => {
      console.log("Un Mounting")
      setCurrentState("beforeUnMounting")
    }
  }, [])

  console.log("Before Render: ", currentState)
  return (
    <input type="text" value="" placeholder="Enter your name" />
  )
}
```

Order of events:
1. `Before Render: beforeMounted` will be logged
2. `<input />` field would render
3. `On Mount` will be logged
4. Component State gets updated
5. `Before Render: mounted` will be logged
6. `<input />` field re-renders
7. ... something un-mounts the component
8. `Un Mounting` will be logged

**Note** even though we `setCurrentState()` in the un-mount function, it's side affect is disregarded as the next operation is to destroy that function anyway.

---

## Component Hooks

### useEffect

We've briefly covered `useEffect` in the above example, specifically around the mounting and un-mounting of Components. However, `useEffects` can be used for more than that. They can be used to execute a bit of code upon any of its dependencies changing, for example:

```tsx
function RenderEverySecond() {
  const [second, setSecond] = React.useState(0);

  React.useEffect(() => {
    setInterval(() => { setSecond(state => state + 1)}, 1000);
  }, [])

  React.useEffect(() => {
    console.log(second)
  }, [second])

  return `Seconds: ${seconds}`
}
```

**Notes:**
* On component mount, we've setup an Interval to update the Components State: `second`, every second.
* We've created a new `useEffect` hook which depends on the `second` State value. Upon `second` State value change it will console logs out the value of `second`.

Try to keep the dependency array small and if you find it's bloating then it's a good indication there may be a better way to solve the problem.

**Referencing deeply nested objects**

Lets say your dependency consists of:

```tsx
  const [anObject, setAnObject] = React.useState({
    aString: '3',
    aNumber: 3,
    anotherObject: {
      bString: 'b',
      bNumber: 4
    }
  })

  React.useEffect(() => {
    console.log(anObject.aString)
  }, [anObject])
```

:warning: The above dependency reference is valid, however be warned if any of the other properties for `anObject` change, the a new Object reference will be returned, thus will be treated as a change int he dependency.

```tsx
  const [anObject, setAnObject] = React.useState({
    aString: '3',
    aNumber: 3,
    anotherObject: {
      bString: 'b',
      bNumber: 4
    }
  })

  React.useEffect(() => {
    console.log(anObject.aString)
  }, [anObject.aString])
```

:champagne: The above will now only register the `anObject.aString` reference as part of the `useEffects` dependency checks, thus if any of the other properties changes it will not affect this bit of code.

### useCallback

The `useCallback` hook is nifty in that binds functions against the Component for the duration of its lifecycle. As such, upon component re-computation these functions will only be regenerated upon dependency change (identical to what we walked through earlier). Without the `useCallback` hook functions will be continuously be recreated against the Component, thus each reference to those functions will trigger side effects.

```tsx
function NameField() {
  const [name, setName] = React.useState("");

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event?.target.value)
  }

  return (
    <input
      onChange={onChange}
      placeholder="Enter your name"
      type="text"
      value={name}
    />
  )
}
```

In the above example we have:
* Created an `onChange` variable which returns a function, expecting `event` as an argument.
* We then refer to that function in the `inputs[onChange]` property.

Every time the component updates, the `onChange` variable will be set with a new function; causing a side-effect an unnecessary re-render (opinionated). To solve this we can simply wrap that function with a `useCallback` hook, like so:

```tsx
function NameField() {
  const [name, setName] = React.useState("");

  const onChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event?.target.value)
  }, [])

  return (
    <input
      onChange={onChange}
      placeholder="Enter your name"
      type="text"
      value={name}
    />
  )
}
```

Just like that, the reference to the function will persist until the dependency changes.

### useMemo

I like to think of `useMemo` a "gate", where you can wrap a function with a key (in this case the dependency array). When the key changes then the chunk of code should re-execute, and the new `useMemo` gate should be locked with the new key shape.

`useMemo` is special in that you can apply it in numerous scenarios, ultimately to improve performance. Let's walk through some scenarios.

#### Scenario 1: Expensive Computations

```tsx
interface Props {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
  g: number;
}
function SpaceshipDiagnostics(props: Props) {
  const projection = veryExpensiveCalculation(props.a);

  return (
    <>
      ...Content using other Props...
      {projection}
    </>
  )
}
```

In the above example the `SpaceshipDiagnostics` is being injected with lots of Props (a-g). The `veryExpensiveCalculation` function only requires the `a` value in order for it to be calculated. However when any of the other props (b-g) change, the `veryExpensiveCalculation` will execute each time, ultimately deterring the UX.

This is a good scenario to implement `useMemo` around the `veryExpensiveCalculation`; like so:

```tsx
interface Props {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
  g: number;
}
function SpaceshipDiagnostics(props: Props) {
  const projection = React.useMemo(() => {
    veryExpensiveCalculation(props.a)
  }, [props.a]);

  return (
    <>
      ...Content using other Props...
      {projection}
    </>
  )
}
```

`veryExpensiveCalculation` function will only be called if `props.a` changes, irrespective of when the other dependency items change.

#### Scenario 2: Expensive Renders

In terms of overall performance rendering in the DOM is expensive. We are able to visually notice glitches in animations, or actions not registering, or responses not being instant etc. To help with this overload we can implement `useMemo` to only render what we care about. I find this implementation especially useful when your component relies on multiple hooks to produce its content.

```tsx
interface Props {
  a: number;
  b: number;
  c: number;
}
function SpaceshipDashboard(props: Props) {
  const { flag }  = useSpaceshipState()
  const { frequency } = useRF()
  const { dark }  = useTheme()
  const calculatedValue = (props.a - props.b) * t9

  return (
    <>
      ...Lots of expensive rendering UI...
      {flag, frequency, props.c, calculatedValue}
    </>
  )
}
```

In the above example the `SpaceshipDashboard` relies on multiple props and hooks to render its UI. For demonstration purposes let's imagine the rendering of this component is really slow; we can implement `useMemo` around the `return` block to cache it.

```tsx
interface Props {
  a: number;
  b: number;
  c: number;
}
function SpaceshipDashboard(props: Props) {
  const { flag }  = useSpaceshipState()
  const { frequency } = useRFState()
  const { t9 }  = useTransistorState()
  const calculatedValue = (props.a - props.b) * t9

  return React.useMemo(() => (
    <>
      ...Lots of expensive rendering UI...
      {flag, frequency, props.c, calculatedValue}
    </>
  ), [flag, frequency, props.c, calculatedValue)
}
```

#### Scenario 3: Prop Drilling Madness

In the case when you have to pass a lot of props to a child component and the parent component re-renders a lot of time (making the child components re-render unnecessarily); you can then implement React's `memo()` function around your Child component. This will implement a Higher-order-Component around the Child, applying shallow-level comparison checks against the `memoized` key vs the input prop values.

Here are a few ways you can implement it:

```tsx
// As a function
function ComponentWithLotsOfProps(props: Props) {...}
export default ComponentWithLotsOfProps(memo(props));

// As a const
export const ComponentWithLotsOfProps = memo((props: Props) => {...})
export default ComponentWithLotsOfProps;
```


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

<!-- ## Performance Considerations

It's good to understand how Components can affect your overall Application UX, in terms of performance.
Every time you render a Component it gets attached to React's virtual DOM. React stores the virtual DOM in memory, it represents the UI and maintains all of the Applications State in something called "Fibers". Fibers hold additional information of each of the Components along side the tree and its main purpose is to reconcile changes and enable incremental rendering of the Virtual DOM.

> **Would you prefer to render an entire page or a small subset?**

That's why it's good practice to break down Components into smaller chunks. When a change occurs in the tree the reconciliation process will identify what parts of the tree have made enough noise to warrant it to re-render.

Here's a screenshot of how our AppBar's Toolbar is represented in the Fiber tree:
![Screenshot of a Fiber node](/img/fed-talk/s01e04/fiber.png)


--- -->

## :pray: Closing

At this stage you should understand React's component lifecycle and how to attach logic throughout its phases. You should understand the difference between React hooks, how and when to apply them.

You are now ready to move onto the next episode where I'll be walking you through how to manage state in React, covering the following topics:

* What is state and why is it important?
* The history of State management
* My preference
* Performance Considerations

[Previous Episode:<br/><strong>Material UI Theme</strong>](/2021/06/11/fed-talk-s01e03-routing){: .btn.chevron.chevronLeft}

---

Don't be shy, [get in touch with us!](https://www.mechanicalrock.io/lets-get-started)

![Mechanical Rock Logo](/img/mr-logo-dark-landscape.jpg)
