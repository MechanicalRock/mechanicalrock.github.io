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

In a [captivating blog post](https://blog.mechanicalrock.io/2023/07/03/react-and-unity.html) we delved into the exciting realm of React and Unity. If you've had the opportunity to read that article, you're likely familiar with the architecture of the digital twin and the event life cycles that occur between React and Unity.

In this blog post, our primary focus will be on exploring the testing of integration between Unity and React using Jest, React Testing Library, and the principles of BDD (Behavior-Driven Development).

To demonstrate the concepts discussed, we will jointly develop a small feature that allows users to add a scene to a given animation. When a user adds a scene, React will work behind the scenes by executing a command and sending a request to Unity, asking for the player's position and a screenshot of their current view.

During the execution of this command in the Unity world, React will actively listen for the event that is returned from Unity. Once the event is received, we can capture the player's position and save the screenshot file accordingly.

### React Layer

To begin, let's define the Unity Event Type and the necessary commands that we will execute.

In the integration between Unity and React, we need to configure interfaces and Unity event types that will facilitate communication between the two frameworks. This Event Type will serve as a structured format for exchanging information and triggering actions.

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
export const executeCommand = <T extends CommandName>(command: CommandPayload<T>, unityContent: UnityContent): void => {
  const finalJson = stringifyCommand(command);
  try {
    if (!unityContent.send) {
      throw new Error(`Failed to call Unity: ${finalJson}`);
    }
    unityContent.send("jsApi", "ExecuteCommand", finalJson);
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

BDD (Behavior-Driven Development) is an agile software development methodology that focuses on collaboration and communication between developers, quality assurance (QA) engineers, and business stakeholders. It aims to ensure that software development efforts align with business requirements and produce valuable outcomes. In BDD, the behavior of the system is described in a common language that is easily understandable by all stakeholders.

If you are new to the BBD (Behavior-Driven Development) concept, I recommend reading the article titled ["Example Mapping in Practice"](https://blog.mechanicalrock.io/2023/03/21/example-mapping-in-practice.html#:~:text=Example%20Mapping%20is%20a%20technique,common%20understanding%20amongst%20the%20team) This article provides a comprehensive overview of BDD, its principles, and how it can be applied in software development.

### Expected Behavior

Now that we have completed all the necessary setup and configuration, it's time to start developing our first component using Behavioral Development Driven (BDD) principles. BDD helps us define the expected behavior of our component in a clear and understandable manner. Here's the expected behavior for our component:

```tsx
// addScene.feature
Scenario: Add New Scene
  Given Drew views the animation details
  When Drew adds a new scene
  Then The scene has to be added
```

#### BDD Feature Steps

Let's dive into the development of our component, considering the expected behavior outlined above. By using BDD, we can create clear and comprehensive test cases and scenarios that cover various use cases and edge cases. This ensures that our component functions as expected in different scenarios and meets the desired behavior defined through BDD. To achieve this objective, we leverage the capabilities of Jest Cucumber for loading the feature file and utilize the React Testing Library.

```tsx
// addScene.steps.tsx

import { screen, waitFor } from "@testing-library/dom";
import { defineFeature, loadFeature } from "jest-cucumber";
import { act } from "react-dom/test-utils";

export const ViewToRender = () =>
  render(
    <UnityContextProvider>
      <MockedProvider>
        <AnimationProvider>
          <AnimationView />
        </AnimationProvider>
      </MockedProvider>
    </UnityContextProvider>,
  );

// --------------------------
// Feature
// --------------------------
const feature = loadFeature("./addScene.feature");

defineFeature(feature, (test) => {
  beforeEach(() => {
    ViewToRender();
  });
  test("Add New Scene", ({ given, when, and, then }) => {
    given("Drew views the animation details", async () => {
      await selectAnimationFromList(0);
    });
    when("When Drew adds a new scene", async () => {
      // await to see the animation details
      const list = screen.queryByTestId("view-animation-details");
      await waitFor(() => {
        expect(list).not.toBeNull();
      });
      // Add new scene that will trigger a unity event
      await addNewScene();
    });
    then("The scene has to be added", async () => {
      // await to see the app state has been updated with new scene
      await waitFor(() => {
        const sceneCards = screen.queryAllByTestId(/scene-title-/);
        expect(sceneCards).toHaveLength(1);
      });
    });
  });
});
```

If you execute the test, you will observe a failure because there is currently no corresponding code implemented for it. To enhance the readability of our test steps, we have incorporated helper functions that encapsulate the actions and assertions involved. By doing so, we make the test steps more expressive and easier to understand.

Now, it is time to implement the helper functions and determine the approach for evaluating or mocking the Unity events. If our objective is to verify that the correct command is executed and submitted to Unity upon a user event, such as "add a new scene," we can utilize Jest mocks. However, if we need to mock the callback function when React sends a command to Unity, we must appropriately mock the event handler with mock data. I will illustrate how to accomplish this shortly.

```ts
// featureFunctions.ts
export async function selectAnimation(index: number) {
  await waitFor(() => {
    expect(screen.queryByTestId(`open-animation-${index}`)).not.toBeNull();
  });

  act(() => {
    fireEvent.click(screen.queryByTestId(`open-animation-${index}`));
  });
}
// Mock the Unity Response `returnedPlayerPositionAndPerspective`
// So that callback is called and the scene is added

async function getPlayerPositionUnityEvent(x: number, y: number, z: number) {
  const event = JSON.stringify({
    eventName: "receivedAnimationSceneDetails",
    args: JSON.stringify({
      playerPosition: { x: x, y: y, z: z },
      screenshotData: "base64 image data",
    }),
  });
  act(() => {
    const handler = eventHandler(true, "");
    handler(event);
  });
  await waitFor(() => {
    expect(window.unityEvent).not.toBeUndefined();
  });
}

export async function addNewScene(index?: number) {
  await waitFor(() => {
    expect(screen.queryByTestId("button-add-scene")).not.toBeNull();
  });
  act(() => {
    fireEvent.click(screen.queryByTestId("button-add-scene")!);
  });

  await waitFor(() => {
    // this would be our helper function to mock the unity response
    // so now, each time we add a new scene the mocked player position is return and
    // React app will simply update the app state with the returned data.
    getPlayerPositionUnityEvent(50, 50, 120);
  });
}
```

#### Animation UI Component With Scene Cards

Having defined the expected behavior for this feature, we can now proceed to implement the component that fulfills these requirements.

```tsx
// animationView.tsx
import { CardActions, CardContent, styled, TextField, Typography } from "@mui/material";
import React, { FC, useCallback } from "react";
import AddButtonMenu from "../AddMenuButton";
// to understand the animation context provider please refer to the provided github repository
import { setScenes, useAnimationDispatch, useAnimationState } from "../AnimationProvider";
import { SceneCard } from "../SceneCard";

const ViewAnimation: FC = () => {
  const dispatch = useAnimationDispatch();
  const { scenes } = useAnimationState();
  const hasScenes = updatedScenes.length > 0;

  return (
    <Stack data-testid="view-animation-details">
      <AddButtonMenu previousIndex={null} />
      <StyledCardContent sx={{ pt: 0, pb: hasScenes ? "4em" : undefined }}>
        {updatedScenes.map(SceneWrapper)}
      </StyledCardContent>
    </Stack>
  );
};

function SceneWrapper(scene: SceneDetails, index: number, scenes: SceneDetails[]) {
  return (
    <React.Fragment key={scene?.id || index}>
      <SceneCard index={index} scene={scene} nextScene={scenes[index + 1]} />
    </React.Fragment>
  );
}

export default ViewAnimation;
```

```tsx
// Button component

import { useUnityEventEffect } from "@fuse-ui/unity-interface";
import { AddRounded } from "@mui/icons-material";
import { Box } from "@mui/material";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import * as React from "react";
// to understand the animation context provider please refer to the provided github repository
import { addScene, useAnimationToolDispatch, useAnimationToolState } from "../AnimationToolProvider";

// command to get player position
export const getAnimationSceneDetails = () => {
  executeCommand({
    name: "getAnimationSceneDetails",
    args: {
      width: 134,
      height: 180,
    },
  });
};

const StyledAddSceneButton = styled(Button)(() => ({
  background: "#01579B",
  width: "100%",
  marginTop: "1rem",
}));

export default function AddButton() {
  const { animationDetails } = useAnimationToolState();
  const dispatch = useAnimationToolDispatch();
  const SceneIndex = previousIndex === null ? 0 : previousIndex + 1;
  const [waitingForUnity, setWaitingForUnity] = React.useState(false);

  // helper callback function
  const onAddScene = React.useCallback(
    (playerPosition: XYZ, screenshotData: string) => {
      setWaitingForUnity(false);
      addScene(
        dispatch,
        {
          animationId: animationDetails?.id,
          title: `Scene ${SceneIndex}`,
          siteCode: siteCode,
          file: screenshotData,
          sceneSetting: {
            transition: {
              transitionType: TransitionType.Linear,
              transitionTime: defaultTransitionTime,
              curveDegrees: 0,
            },
            playerPosition: roundPlayerPosition(playerPosition),
            delayTime: defaultDelayTime,
            order: SceneIndex,
          },
        },
        SceneIndex,
      );
    },
    [SceneIndex, dispatch, siteCode, updatedAnimationDetails?.id],
  );

  // subscribes on receivedAnimationSceneDetails event and on receiving
  // response with event name receivedAnimationSceneDetails from unity, it will update the app
  // stage with new scene
  useUnityEventEffect(
    ({ playerPosition, screenshotData }) => {
      if (waitingForUnity) {
        const base64 = convertUnityImageToBase64(screenshotData);
        onAddScene(roundPlayerPosition(playerPosition), base64);
      }
    },
    [onAddScene, waitingForUnity],
    "receivedAnimationSceneDetails",
  );

  const handleAddScene = () => {
    setWaitingForUnity(true);
    // React executes `get animation details` command on add scene
    // and gets the scene back
    getAnimationSceneDetails();
  };

  return (
    <StyledAddSceneButton
      id="add-scene-lock-button"
      data-testid={`button-add-scene`}
      variant="contained"
      disableElevation
      onClick={handleAddScene}
      sx={{
        justifyContent: "space-between",
      }}>
      <Box display="flex" marginLeft="-0.5em">
        <AddRounded />
        <Box marginLeft="0.2em">Add Scene</Box>
      </Box>
    </StyledAddSceneButton>
  );
}
```

By following the BDD approach and mocking the response from Unity's event handler, we can seamlessly develop our feature. Jest provides the capability to mock the Unity response, allowing us to simulate different scenarios during testing.

In addition to this approach, there is another method to verify Unity commands. By mocking the Unity context provider, we can assert whether a specific event has been called with the correct event name. Here is an example of such a test:

```tsx
import { executeCommand } from "./commandType";
import React, { FC } from "react";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing";

jest.mock("@fuse-ui/unity-interface", () => ({
  executeCommand: jest.fn(),
}));

const wrapper: FC = ({ children }) => <UnityContextProvider>{children}</UnityContextProvider>;

describe("Should Call getAnimationSceneDetails command", () => {
  it("should execute the getSceneDetails command when clicked add scene", () => {
    const executeCommandFn = jest.fn();
    executeCommand.mockImplementation(executeCommandFn);

    const { getByTestId } = render(<AddButton />, { wrapper });

    userEvent.click(getByTestId("button-add-scene"));

    expect(executeCommandFn).toHaveBeenCalledWith({
      args: {},
      name: "getAnimationSceneDetails",
    });
  });
});
```

### Conclusion

In conclusion, integrating Unity with React opens up exciting possibilities for building immersive and interactive applications. By adopting the Behavior-Driven Development (BDD) approach, we can ensure that our software meets the desired behavior and aligns with business objectives. BDD emphasizes collaboration, communication, and test automation, enabling teams to work together effectively and deliver high-quality applications.

Through the use of tools like Jest Cucumber and React Testing Library, we can write readable and expressive test scenarios that capture the behavior of our Unity and React components. These tests serve as living documentation, providing clarity on the expected behavior and enabling easy maintenance and collaboration among team members.

If you're eager to explore more about Unity and React integration with BDD, you can check out the accompanying GitHub repository that provides code examples. You can find the GitHub repository [here]().

We hope this blog post has been informative and has sparked your interest in utilizing BDD for Unity and React development. If you have any questions or require professional assistance, feel free to [reach out to us]() at.

Thank you for reading, and happy coding!
