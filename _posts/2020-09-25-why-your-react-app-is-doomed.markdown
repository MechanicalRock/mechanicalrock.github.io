---
layout: post
title: Why your React app is Doomed, and what to do about it
date: 2020-09-25
tags:
author: Dylan R. Johnston
---

tl;dr React and JSX fundamentally has the wrong compositional interface, and very awkwardly attempts to work around it.

- Programming is all about solving small problems, and composing them to solve bigger problems
- The way a program can be composed is very important to its long term "health"
- React Components are functions from `Props -> JSX`
- This would be fine is React Components were just "Views" in the MVC sense, i.e. pure rendering logic, no side effects or business logic
- However, most people think of a component as a bundle of not only its rendering logic, but its associated business logic, and effects (useState, useQuery, etc)
- So an enriched React "Component" is not just a function from `Props -> JSX`, `Props -> (JSX, State, IO, UI events, etc)`
- The React community has had several approaches to solve this issue

  - Callbacks

    - A function that takes a callback is a function that has more than one output
    - ```
      const foo = (f: (text: string) => void): number => {
        f("Some text")

        return 3
      }
      ```

    - This is a function that "outputs" both a string and a number, one via its return, and one via a callback.
    - Normally you'd just write `() => [string, number]`, unless if you were forced to conform to an interface of for functions that only returned numbers, in which case taking a callback is a side-channel for outputting more values.
    - A react components must be a function from `Props -> JSX`, so it emit UI events we take a callback as a prop to get around that restriction on our composition
    - ```
      interface Props {
        onClick: (data: string) => void
      }

      const Component: React.FC<Props> = ({ onClick }) =>
        <button onClick={() => onClick("According to all known laws of aviation...")}>
      ```

    ```
    * If you start looking at your React code, you'll see this everywhere, callbacks are being used to work around the react component interface
    * So why is this a problem? Because callbacks lead to a weird mix of regular and inverted control flow and become difficult to reason about at scale which is why Promises were introduced instead of sticking with asynchronous callbacks
    ```

  - Redux
    - Redux embraces the idea that react components should be simply views and the business logic and effects handling should live elsewhere
    - However this leads to tons of boilerplate and increased cognitive overhead as things that work together (React component, reducer, action creators) do not live together
      - Ducks as a response to this problem https://github.com/erikras/ducks-modular-redux
        - "Component" is now a module, containing several separate pieces that can be composed separately but still live together
        - The react part is just one part of a richer compositional interface
    - Redux also connects all components at all parts of the component tree directly to the global store breaking encapsulation and scale invariance of the components as they all become coupled to the global store, makes refactoring and encapsulation much harder
  - Class components
    - Uses function binding to side load in extra stuff avoiding props
  - Hooks
    - Abuses hidden mutable variables react manages in the dark to essentially do the exact same thing as class components while pretending to be functional (Look mah, no class keyword). Has all the same problems as class components but slightly neater as life cycle effects are organised by functionality instead of life cycle.

- Cycle.js
  - Embraces the fact that a component is a much richer relation between multiple inputs (sources) and multiple outputs (sinks).
  - Components can be composed in a scale invariant "fractal" manner
  - Super easy to test, everything is just data in, data out, no need for mocks or anything else
  - Shill cycle.js some more

In summary components are more than just `Props -> JSX` and the React community twists itself in knots trying to avoid acknowledging it
