---
layout: postv2
font: serif
title: "Unity & React Behaviour Development Driven"
description: "BDD testing with react library and unity event handlers"
date: 2023-07-18
highlight: monokai
image: /img/unity-react-bdd/app-view.png
author: Nadia Reyhani
tags: [React, React Components, Unity, Digital Twin, BDD, React Testing]
---

### Introduction

In a [captivating blog post](https://blog.mechanicalrock.io/2023/07/03/react-and-unity.html) we delved into the exciting realm of React and Unity. If you've had the opportunity to read that article, you'll then be familiar with how to setup the event lifecycle between Unity and React by implementing a layered architecture.

In this blog post, our primary focus will be on exploring the testing of integration between Unity and React using Jest, React Testing Library, and the principles of BDD (Behaviour Driven Development).

To demonstrate the concepts discussed, we will jointly develop a small feature that allows users to add a fruit to a given fruit basket. When a user adds a fruit, React will execute a command to Unity, asking for the fruit specifications and a screenshot of how the fruit looks like.

React will actively listen for the event soon to be returned by the Unity layer. Once the event is received, we can capture the fruit specifications and screenshot data.

### React Layer

To begin, let's define the Unity Event Type and the necessary commands that we will execute.

In the integration between Unity and React, we need to configure interfaces and Unity event types that will facilitate communication between the two layers. This Event Type will serve as a structured format for exchanging information and triggering actions.

Additionally, we must identify the specific commands that React will execute to interact with Unity. These commands will be responsible for instructing Unity to perform tasks such as retrieving the fruit specifications and capturing a screenshot of the fruit.

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
  getFruitSpecifications: EmptyObject;
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

// Define the payload structure for the "receivedFruitSpecifications" event.
interface ReceivedFruitSpecifications extends EventPayloadType {
  name: "receivedFruitSpecifications";
  args: {
    playerPosition: { x: number; y: number; z: number };
    screenshotData: string;
  };
}
// Create a union type of all possible event payloads. for now we only include one event.
type EventPayloadUnion = ReceivedFruitSpecifications;

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

import React, { FC } from "react";

const App: FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <UnityContextProvider>
      <Component {...pageProps} />
    </UnityContextProvider>
  );
};

const AppWrapper: FC<AppProps> = (appProps) => {
  return <App {...appProps} />;
};

export default AppWrapper;
```

Now, the Unity context will be accessible throughout the app, allowing you to subscribe to Unity events, interact with Unity functionalities, and utilize custom hooks such as `useUnityEventSubscription` and `useUnityEventEffect` in any component within your app.

By wrapping your app with the UnityContextProvider, you establish a bridge between Unity and your React app, enabling seamless integration and communication between the two environments.

### Behaviour Driven Development Testing & Unity Event Mocks

BDD is an agile software development methodology that focuses on collaboration and communication between developers, quality assurance (QA) engineers, and business stakeholders. It aims to ensure that software development efforts align with business requirements and produce valuable outcomes. In BDD, the behaviour of the system is described in a common language that is easily understandable by all stakeholders.

If you are new to the BBD concept, I recommend reading the article titled ["Example Mapping in Practice"](https://blog.mechanicalrock.io/2023/03/21/example-mapping-in-practice.html#:~:text=Example%20Mapping%20is%20a%20technique,common%20understanding%20amongst%20the%20team) This article provides a comprehensive overview of BDD, its principles, and how it can be applied in software development.

### Expected behaviour

Now that we have completed all the necessary setup and configuration, it's time to start developing our first component using BDD principles. BDD helps us define the expected behaviour of our component in a clear and understandable manner. Here's the expected behaviour for our component:

```tsx
// addFruit.feature
Scenario: The one where Drew Adds a New Fruit
  Given Drew views the fruit list
  When Drew adds a new fruit
  Then The fruit should be added
```

#### BDD Feature Steps

Let's dive into the development of our component, considering the expected behaviour outlined above. By using BDD, we utilise the power of examples to create clear and comprehensive tests that cover many scenarios. This ensures that our component functions as expected in different scenarios and meets the desired behaviour. To achieve this objective, we leverage the capabilities of Jest Cucumber for loading the feature file and utilise the React Testing Library.

```tsx
// addFruit.steps.tsx

import { screen, waitFor } from "@testing-library/dom";
import { defineFeature, loadFeature } from "jest-cucumber";
import { act } from "react-dom/test-utils";

export const ViewToRender = () =>
  render(
    <UnityContextProvider>
      <FruitListProvider>
        <ViewFruitList />
      </FruitListProvider>
    </UnityContextProvider>,
  );

// --------------------------
// Feature
// --------------------------
const feature = loadFeature("./features/addFruit.feature");

defineFeature(feature, (test) => {
  beforeEach(() => {
    ViewToRender();
  });
  test("The one where Drew Adds a New Fruit", ({ given, when, and, then }) => {
    given("Drew views the fruit list", async () => {
      // wait to see the fruit list
      getFruitList();
    });
    when("Drew adds a new fruit", async () => {
      // Add new fruit that will trigger a unity event
      await addNewFruit();
    });
    then("The fruit should be added", async () => {
      // await to see the app state has been updated with new fruit
      await waitFor(() => {
        const fruitCard = screen.queryAllByTestId(/fruit-title-/);
        expect(fruitCard).toHaveLength(1);
      });
    });
  });
});
```

If you execute the test, you will observe a failure because there is currently no corresponding code implemented for it. To enhance the readability of our test steps, we have incorporated helper functions that encapsulate the actions and assertions involved. By doing so, we make the test steps more expressive and easier to understand.

Now, it is time to implement the helper functions and determine the approach for evaluating or mocking the Unity events. If our objective is to verify that the correct command is executed and submitted to Unity upon a user event, such as "add a new fruit" we can utilize Jest mocks. However, if we need to mock the callback function when React sends a command to Unity, we must appropriately mock the event handler with mock data. I will illustrate how to accomplish this shortly.

```ts
// featureFunctions.ts
export async function selectFruitList(index: number) {
  await waitFor(() => {
    expect(screen.queryByTestId(`open-fruit-list-${index}`)).not.toBeNull();
  });

  act(() => {
    fireEvent.click(screen.queryByTestId(`open-fruit-list-${index}`));
  });
}
// Mock the Unity Response `returnedPlayerPositionAndPerspective`
// So that callback is called and the fruit is added

async function getFruitSpecificationsUnityEvent(x: number, y: number, z: number) {
  const event = JSON.stringify({
    eventName: "receivedFruitSpecifications",
    args: JSON.stringify({
      fruitSpecification: { x: x, y: y, z: z },
      screenshotData: "base64 image data",
    }),
  });
  act(() => {
    const handler = eventHandler(true, ""); // TO DO: FIX
    handler(event);
  });
  await waitFor(() => {
    expect(window.unityEvent).not.toBeUndefined();
  });
}

export async function addNewFruit(index?: number) {
  await waitFor(() => {
    expect(screen.queryByTestId("button-add-fruit")).not.toBeNull();
  });
  act(() => {
    fireEvent.click(screen.queryByTestId("button-add-fruit")!);
  });

  // this would be our helper function to mock the unity response
  // so now, each time we add a new fruit the mocked fruit specifications is return and
  // React app will simply update the app state with the returned data.
  await getFruitSpecificationsUnityEvent(50, 50, 120);
}
```

#### Fruit List UI Component With Fruit Cards

Having defined the expected behaviour for this feature, we can now proceed to implement the component that fulfills these requirements.

```tsx
// FruitListView.tsx
import { CardActions, CardContent, styled, TextField, Typography } from "@mui/material";
import React, { FC, useCallback } from "react";
import AddButton from "../AddButton";
// to understand the fruit context provider please refer to the provided github repository
import { useFruitDispatch, useFruitState } from "../FruitListProvider";
import { FruitCard } from "../FruitCard";

const ViewFruitList: FC = () => {
  const dispatch = useFruitDispatch();
  const { fruits } = useFruitState();
  const hasFruits = fruits.length > 0;

  return (
    <Stack data-testid="view-fruit-list">
      <AddButtonMenu />
      <StyledCardContent sx={{ pt: 0, pb: hasFruits ? "4em" : undefined }}>
        {fruits.map(FruitWrapper)}
      </StyledCardContent>
    </Stack>
  );
};

function FruitWrapper(fruit: FruitDetails, index: number, fruits: FruitDetails[]) {
  return (
    <React.Fragment key={fruit?.id || index}>
      <FruitCard index={index} fruit={fruit} nextFruit={fruits[index + 1]} />
    </React.Fragment>
  );
}

export default ViewFruitList;
```

```tsx
// Button component

import { useUnityEventEffect } from "./unityProvider";
import { AddRounded } from "@mui/icons-material";
import { Box } from "@mui/material";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import * as React from "react";
// to understand the context provider please refer to the provided github repository
import { addFruit, useFruitDispatch, useFruitState } from "../FruitListProvider";

// command to get player position
export const getFruitSpecifications = () => {
  executeCommand({
    name: "getFruitSpecifications",
    // JS api expect to receive the width and height as arguments to generate the screenshot
    args: {
      width: 134,
      height: 180,
    },
  });
};

const StyledAddFruitButton = styled(Button)(() => ({
  background: "#01579B",
  width: "100%",
  marginTop: "1rem",
}));

export default function AddButton() {
  const { fruitList } = useFruitState();
  const dispatch = useFruitDispatch();
  const fruitIndex = previousIndex === null ? 0 : previousIndex + 1;
  const [waitingForUnity, setWaitingForUnity] = React.useState(false);

  // helper callback function
  const onAddFruit = React.useCallback(
    (fruitSpecifications: XYZ, screenshotData: string) => {
      setWaitingForUnity(false);
      addFruit(
        dispatch,
        {
          fruitListId: fruitList?.id,
          title: `Fruit ${fruitIndex}`,
          file: screenshotData,
          fruitSpecifications: fruitSpecifications,
        },
        fruitIndex,
      );
    },
    [fruitIndex, , dispatch, fruitList?.id],
  );

  // subscribes on receivedFruitSpecifications event and on receiving
  // response with event name receivedFruitSpecifications from unity, it will update the app
  // stage with new fruit
  useUnityEventEffect(
    ({ fruitSpecifications, screenshotData }) => {
      if (waitingForUnity) {
        const base64 = convertUnityImageToBase64(screenshotData);
        onAddFruit(fruitSpecifications, base64);
      }
    },
    [onAddFruit, waitingForUnity],
    "receivedFruitSpecifications",
  );

  const handleAddFruit = () => {
    setWaitingForUnity(true);
    // React executes `getFruitSpecifications` command on add fruit
    // and gets the fruit specifications back
    getFruitSpecifications();
  };

  return (
    <StyledAddFruitButton
      id="add-fruit-lock-button"
      data-testid={`button-add-fruit`}
      variant="contained"
      disableElevation
      onClick={handleAddFruit}
      sx={{
        justifyContent: "space-between",
      }}>
      <Box display="flex" marginLeft="-0.5em">
        <AddRounded />
        <Box marginLeft="0.2em">Add Fruit</Box>
      </Box>
    </StyledAddFruitButton>
  );
}
```

![test results](../img/unity-react-bdd/bdd-test.png)

By following the BDD approach and mocking the response from Unity's event handler, we can seamlessly develop our feature. Jest provides the capability to mock the Unity response, allowing us to simulate different scenarios during testing.

In addition to this approach, there is another method to verify Unity commands. By mocking the Unity context provider, we can assert whether a specific event has been called with the correct event name. Here is an example of such a unit test:

```tsx
// jestMock.test.tsx
import { executeCommand } from "../components/unityProvider/commandType";
import UnityContextProvider from "../components/unityProvider/UnityContextProvider";
import React, { FC } from "react";
import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { FruitListProvider } from "../components/FruitListProvider";
import ViewFruitList from "../components/fruitListView";
import { act } from "react-dom/test-utils";

jest.mock("../components/unityProvider/commandType", () => ({
  executeCommand: jest.fn(),
}));

const wrapper: FC<{}> = ({ children }) => (
  <UnityContextProvider>
    <FruitListProvider>{children}</FruitListProvider>
  </UnityContextProvider>
);

describe("Should Call getFruitSpecifications command", () => {
  it("Should execute the getFruitSpecifications command when clicked add fruit", async () => {
    const executeCommandFn = jest.fn();
    executeCommand.mockImplementation(executeCommandFn);
    render(<ViewFruitList />, { wrapper });

    await waitFor(() => {
      expect(screen.getByTestId("button-add-fruit")).not.toBeNull();
    });
    act(() => {
      fireEvent.click(screen.getByTestId("button-add-fruit"));
    });
    await waitFor(() => {
      expect(executeCommandFn).toHaveBeenCalledWith({
        // As previously explained `getFruitSpecifications` expect to receive height and width arguments
        args: { height: 180, width: 134 },
        name: "getFruitSpecifications",
      });
    });
  });
});
```

### Conclusion

In conclusion, integrating Unity with React opens up exciting possibilities for building immersive and interactive applications. By adopting the Behaviour Driven Development (BDD) approach, we can ensure that our software meets the desired behaviour and aligns with business objectives. BDD emphasizes collaboration, communication, and test automation, enabling teams to work together effectively and deliver high-quality applications.

Through the use of tools like Jest Cucumber and React Testing Library, we can write readable and expressive test scenarios that capture the behaviour of our Unity and React components. These tests serve as living documentation, providing clarity on the expected behaviour and enabling easy maintenance and collaboration among team members.

If you're eager to explore more about the example codes provided in this post, you can check out the accompanying GitHub repository. You can find the GitHub repository [here](https://github.com/MechanicalRock/unity-react-example).

We hope this blog post has been informative and has sparked your interest in utilizing BDD for Unity and React development. If you have any questions or require professional assistance, feel free to [reach out to us](https://www.mechanicalrock.io/lets-get-started) at.

Thank you for reading, and happy coding!
