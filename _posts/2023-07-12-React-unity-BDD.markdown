---
layout: postv2
font: serif
title: "Unity & React Behavioral Development Driven"
description: "BDD testing with react library and unity event handlers"
date: 2023-07-12
highlight: monokai
image: /img/unity-react/cover.jpg
author: Nadia Reyhani
tags: [React, React Components, Unity, Digital Twin, BDD, React Testing]
---

### Introduction

In a [captivating blog post authored by "Quintin Maseyk"](https://blog.mechanicalrock.io/2023/07/03/react-and-unity.html) we delved into the exciting realm of React and Unity. If you've had the opportunity to read that article, you're likely familiar with the architecture of the digital twi and the event life cycles that occur between React and Unity.

In this blog post, our primary focus will be on exploring the testing of integration between Unity and React using Jest, React Testing Library, and the principles of BDD (Behavioral Development Driven).

To demonstrate the concepts discussed, we will jointly develop a small feature that allows users to add a scene to a given animation. When a user adds a scene, React will work behind the scenes by executing a command and sending a request to Unity, asking for the player's position and a screenshot of their current view.

During the execution of this command in the Unity world, React will actively listen for the event that is returned from Unity. Once the event is received, we can capture the player's position and save the screenshot file accordingly.

### React Layer

To begin, let's define the Unity Event Type and the necessary commands that we will execute.

In the integration between Unity and React, we need to establish a clear understanding of the Unity Event Type that will facilitate communication between the two frameworks. This Event Type will serve as a structured format for exchanging information and triggering actions.

Additionally, we must identify the specific commands that React will execute to interact with Unity. These commands will be responsible for instructing Unity to perform tasks such as retrieving the player's position and capturing a screenshot of their view.

By defining the Unity Event Type and the required commands, we lay the foundation for seamless communication and collaboration between Unity and React in our integration testing scenario.

```ts
// commandType.ts

/* this code defines types, interfaces, and functions related to executing Unity commands from React. It provides a way to execute the command using the UnityContent instance, and handle any potential errors during execution.*/

type EmptyObject = Record<string, never>;
type CommandName = keyof UnityCommands;
type CommandArgs<T extends CommandName = CommandName> = UnityCommands[T];
type CommandPayload<T extends CommandName = CommandName> = {
  name: T;
  args: CommandArgs<T>;
};
interface UnityCommands {
  getPositionAndPerspective: EmptyObject;
}
interface UnityContent {
  send: (gameObjectName: string, methodName: string, finalJson: string) => void;
}
// stringify a command payload
const stringifyCommand = ({ name, args }: CommandPayload) => {
  const unitycommand = {
    name,
    args: JSON.stringify(args),
  };
  const finalJson = JSON.stringify(unitycommand);
  return finalJson;
};

// Function to execute a web command, can be initialised by a user action.
const executeWebCommand = (command: CommandPayload, unityContent: UnityContent): void => {
  const finalJson = stringifyCommand(command);
  if (!unityContent.send) {
    throw new Error(
      `Failed to call Unity. UnityContent class must be passed to executeCommand in web mode - ${finalJson}`,
    );
  }
  unityContent.send("jsApi", "ExecuteCommand", finalJson);
};

export const executeCommand = <T extends CommandName>(command: CommandPayload<T>, unityContent: UnityContent): void => {
  try {
    executeWebCommand(command, unityContent);
  } catch (error) {
    console.info(`Failed to execute command ${command.name}`, command.args);
  }
};
```

```ts
// eventType.ts

// Define the payload structure for an event.
interface EventPayloadType {
  name: string;
  args: Record<string, unknown>;
}

// Define the payload structure for the "receivedAnimationSceneDetails" event.
interface ReceivedAnimationSceneDetails extends EventPayloadType {
  name: "receivedAnimationSceneDetails";
  args: {
    playerPosition: { x: number; y: number; z: number };
    screenshotData: string;
  };
}
// Create a union type of all possible event payloads. for now we only include one event.
type EventPayloadUnion = ReceivedAnimationSceneDetails;

// Define a type for the names of the events and arguments of each event.
export type EventNames = EventPayloadUnion["name"];
export type EventArgs = {
  [N in EventNames]: Extract<EventPayloadUnion, { name: N }>["args"];
};
export type EventPayload<T extends EventNames> = {
  name: T;
  args: EventArgs[T];
};

// Define a mapping of event names to their respective handler functions
export type EventTypeMap = {
  [N in EventNames]: (args: EventArgs[N]) => void;
};
```

### Unity Context Provider & Event Handler

Up until now, our focus has been on setting up the event and command definitions from Unity to make them accessible in our React application.

As mentioned earlier, the Unity layer executes commands upon receiving requests from React and sends the requested data back to the Front End through an event. To ensure that the React app reflects the response from Unity, we will now establish a custom hook to manage the Unity events within our React components. Additionally, we will wrap our app with a context provider to make these events accessible to the browser.

Let's set up the custom hook for managing Unity events in React components and wrap our app with a context provider to make the events accessible to the browser. Here's the code block:

```ts
// UnityContextProvider.ts

import React, { createContext, FC, useContext, useEffect } from "react";

export interface EventsMap {
  [event: string]: (...args: any) => void;
}

export interface DefaultEvents extends EventsMap {
  [event: string]: (...args: any) => void;
}
// Create an event controller that manages events and their handlers
export const createEventController = <Events extends EventsMap = DefaultEvents>(): Emitter<Events> => ({
  events: {},
  emit(event, ...args) {
    (this.events[event] ?? []).forEach((i) => i(...args));
  },
  on(event, cb) {
    (this.events[event] = this.events[event] ?? ([] as Events[typeof event][])).push(cb);
    return () => (this.events[event] = (this.events[event] ?? []).filter((i) => i !== cb));
  },
});

const eventController = createEventController<EventTypeMap>();
const UnityContext = createContext(eventController);

export const eventHandler =
  () =>
  (jsonEvent: string): void => {
    const parsedEvent = JSON.parse(jsonEvent);
    const event: EventPayload<EventNames> = {
      name: parsedEvent.eventName,
      args: typeof parsedEvent.args === "string" ? JSON.parse(parsedEvent.args) : parsedEvent.args,
    };
    // Emit the event with its name and arguments
    eventController.emit(event.name, event.args);
  };

// Unity Context Provider component
const UnityContextProvider: FC = ({ children }) => {
  useEffect(() => {
    initialiseEvents(eventHandler());

    return () => {
      cleanupEvents();
    };
  }, []);
  // Provide the event controller to the UnityContext
  return <UnityContext.Provider value={eventController}>{children}</UnityContext.Provider>;
};
// Custom hook to access the Unity context
export const useUnityContext = (): Emitter<EventTypeMap> => useContext(UnityContext);
export default UnityContextProvider;
```

### React Custom Hook

To subscribe to Unity events and update our app state upon receiving updates for specific events, we can create a custom hook. This hook will handle the event subscription and update our app state accordingly. Here's an example of how you can implement this custom hook:

```ts
// useUnityEventEffect.ts

import { useUnityContext } from "./UnityContextProvider";
import { DependencyList, useCallback, useEffect } from "react";

// Custom hook to subscribe to Unity events and execute an effect
const useUnityEventEffect = <T extends EventNames>(
  effect: EventTypeMap[T],
  deps: DependencyList,
  eventName: T,
): void => {
  const eventController = useUnityContext();
  const effectCallback = useCallback(effect, deps);
  useEffect(() => {
    const unbind = eventController.on<T>(eventName, effectCallback);
    return () => {
      unbind();
    };
  }, [effectCallback, eventController, eventName]);
};

export default useUnityEventEffect;
```

We defined a custom hook called `useUnityEventEffect`. This hook allows you to subscribe to a specific Unity event and execute an effect (callback) when that event occurs. It takes three parameters:

`effect`: The effect (callback function) to execute when the Unity event occurs.
`deps`: An array of dependencies that the effect depends on, similar to the dependencies array in the useEffect hook.
`eventName`: The name of the Unity event to subscribe to.

To make the Unity context available throughout our entire app, we simply need to wrap our app with the `UnityContextProvider` that we created. By doing this, all components within the app will have access to the Unity events and functionalities. Here's how you can wrap your app with the `UnityContextProvider`:

```tsx
// app.tsx

import { UnityContextProvider } from "./UnityContextProvider";
import { CssBaseline } from "@mui/material";

import React, { FC } from "react";
import GlobalEventProvider from "../components/GlobalEventProvider";

const App: FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <UnityContextProvider>
      <CssBaseline />
      <Component {...pageProps} />
    </UnityContextProvider>
  );
};

const AppWrapper: FC<AppProps> = (appProps) => {
  return <App {...appProps} />;
};

export default AppWrapper;
```

Now, the Unity context will be accessible throughout the app, allowing you to subscribe to Unity events, interact with Unity functionalities, and utilize custom hooks such as useUnityEventSubscription and useUnityEventEffect in any component within your app.

By wrapping your app with the UnityContextProvider, you establish a bridge between Unity and your React app, enabling seamless integration and communication between the two environments.

### BDD Testing & Unity Event Mocks

### Expected Behavior

Now that we have all the setup and configuration ready, time to develop our first component with help of behavioral development driven 0r in short BDD. This is will be our expected behavior:

```
Give Drew views the animation details
When Drew adds a new scene
Then Scene has to be added
```

TODO:
review the flow again, to confirm event handling and subscription has been explained as intended.
complete the next two sections:

#### Feature Steps

explain the test steps with Jerkin and implementation

#### Animation Component

UI component
