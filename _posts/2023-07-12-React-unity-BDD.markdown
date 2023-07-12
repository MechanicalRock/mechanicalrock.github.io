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

We recently published [an amazing blog post](https://) written by "Quintin Maseyk" discussing React & Unity. In this blog post, we will discuss how to test integration between Unity and React with jest and react testing library and help of BDD (Behavioral Development Driven).

For demonstration purposes, together we will develope a small feature where user can add a scene into a given animation.
when user adds a scene, under the hood, react will execute command and request Unity to return the player position and a screenshot of the player position view.
While the command is executed in Unity world, React will listen to the event coming back from Unity. once it received the event, then we can capture the player position and screenshot file.

### Unity Interface Set up

Let's start with defining the Unity Event Type and the commands we require to execute.

```ts
// commandType.ts
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

// add sudo code to explain the code
const stringifyCommand = ({ name, args }: CommandPayload) => {
  const unitycommand = {
    name,
    args: JSON.stringify(args),
  };
  const finalJson = JSON.stringify(unitycommand);
  return finalJson;
};

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
interface EventPayloadType {
  name: string;
  args: Record<string, unknown>;
}

interface ReceivedAnimationSceneDetails extends EventPayloadType {
  name: "receivedAnimationSceneDetails";
  args: {
    playerPosition: { x: number; y: number; z: number };
    screenshotData: string;
  };
}
type EventPayloadUnion = ReceivedAnimationSceneDetails;

export type EventNames = EventPayloadUnion["name"];

export type EventArgs = {
  [N in EventNames]: Extract<EventPayloadUnion, { name: N }>["args"];
};

export type EventPayload<T extends EventNames> = {
  name: T;
  args: EventArgs[T];
};
export type EventTypeMap = {
  [N in EventNames]: (args: EventArgs[N]) => void;
};
```

### Unity Context Provider & Event Handler

So far, all we did was about setting up the Unity's event and the command definitions to make them available in the React app.

As we mentioned earlier in this blog post, unity layer executes the command on React's request and sends the requested data back to Front End through an event. To update the React app with the response from Unity we can set up a custom hook to manage the unity events in our react components. Also, to make all these events accessible to the browser we need to wrap our app to a context provider. Now, it's time to set up these two as per code block below:

```ts
// UnityContextProvider.ts

import React, { createContext, FC, useContext, useEffect } from "react";

export interface EventsMap {
  [event: string]: (...args: any) => void;
}

export interface DefaultEvents extends EventsMap {
  [event: string]: (...args: any) => void;
}
// add sudo code to explain the code
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

// add sudo code to explain the code
const eventController = createEventController<EventTypeMap>();
const UnityContext = createContext(eventController);

// add sudo code to explain the code
export const eventHandler =
  () =>
  (jsonEvent: string): void => {
    const parsedEvent = JSON.parse(jsonEvent);
    const event: EventPayload<EventNames> = {
      name: parsedEvent.eventName,
      args: typeof parsedEvent.args === "string" ? JSON.parse(parsedEvent.args) : parsedEvent.args,
    };

    eventController.emit(event.name, event.args);
  };

const UnityContextProvider: FC = ({ children }) => {
  useEffect(() => {
    initialiseEvents(eventHandler());

    return () => {
      cleanupEvents();
    };
  }, []);

  return <UnityContext.Provider value={eventController}>{children}</UnityContext.Provider>;
};

export const useUnityContext = (): Emitter<EventTypeMap> => useContext(UnityContext);
export default UnityContextProvider;
```

### React Custom Hook

to subscribe Unity Events, we would need a custom hook that updates our app state on receiving an update on a particular event:

```ts
import { useUnityContext } from "../UnityContextProvider";
import { DependencyList, useCallback, useEffect } from "react";

// add sudo code to explain the code
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

Now that we have all the prerequisites ready, all we need to do to make the unity available to our entire app is to wrap the app with our created UnityContextProvider:

```tsx
// app.tsx

import { executeCommand, UnityContextProvider } from "./unity-interface";
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

### BDD Testing & Unity Event Mocks

### Expected Behavior

Now that we have all the setup and configuration ready, time to develop our first component with help of behavioral development driven 0r in short BDD. This is will be our expected behavior:

```
Give Drew views the animation details
When Drew adds a new scene
Then Scene has to be added
```

TODO:

#### Feature Steps

explain the test steps with Gerkin and implementation

#### Animation Component

UI component
