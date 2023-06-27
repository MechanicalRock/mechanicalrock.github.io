---
layout: post
font: serif
title: "Unity & React"
description: "Unity for 3D modelling and React for user interfaces. How do we combine the two?"
date: 2023-07-03
highlight: monokai
image: /img/unity-react/cover.jpg
author: Quintin Maseyk
tags: [react, react components, unity]
---

![React & Unity](/img/unity-react/cover.jpg)

ReactJS is designed for building dynamic and interactive web experiences with state management. It allows developers to create reusable components or libraries without having to build everything from scratch. This makes it very easy to add additional functionality or animations onto existing applications. 

Unity is a powerful and versatile platform for 3D development. It is known for its ability to handle complex 3D models and environments, as well as its strong focus on creating visually appealing and interactive experiences. Unity also has a strong community and a wealth of documentation and resources available online.

---

**Table of Contents:**

- [Web View](#web-view)
- [Layered Architecture](#layered-architecture)
  * [Layer 1: Unity Application](#layer-1--unity-application)
  * [Layer 2: Web View](#layer-2--web-view)
  * [Layer 3: React Application](#layer-3--react-application)
  * [Bringing it all together](#bringing-it-all-together)
- [JS API Perspectives](#js-api-perspectives)
  * [Unity Perspective](#unity-perspective)
  * [React Perspective](#react-perspective)
- [Lifecycle of Events](#lifecycle-of-events)
- [Conclusion](#conclusion)

---

## Web View

Unity is a popular platform for building games and interactive experiences, but it also has many features that make it an ideal choice for other types of applications. One such feature is [Web View](https://developer.vuplex.com/webview/overview), which allows you to display web content within your Unity application.

[Web View](https://developer.vuplex.com/webview/overview) can be used to create dynamic user interfaces that can be updated in real-time. For example, if you have a news app built with Unity, you could use [Web View](https://developer.vuplex.com/webview/overview) to display the latest headlines from your website or blog. This would allow users to stay up-to-date on the latest news without having to leave the app.

Another benefit of using [Web View](https://developer.vuplex.com/webview/overview) is that it allows you to easily integrate web-based functionality into your Unity project. If there's a particular API or service that you need access to in order to build your application, you can simply use [Web View](https://developer.vuplex.com/webview/overview) to embed that functionality directly into your project.

[Web View](https://developer.vuplex.com/webview/overview) works by creating a new view within your Unity application where web content can be displayed. You can control this view just like any other element in your scene by adjusting its position and size or adding animations and special effects.

## Layered Architecture

The layered architecture pattern is a software design pattern that divides the system into layers. Each layer has a specific responsibility and interacts with the layers above and below it. The layers are typically organized in a hierarchical fashion, with the highest layer being the user interface layer and the lowest layer being the data/hardware accelerator layer.

### Layer 1: Unity Application

![Layer 1](/img/unity-react/layer-1.png)

The Unity Application is the bottom layer of the architecture. It's responsible for all of the 3D rendering capability. The Unity application communicates with the other layers through a set of interfaces, which are defined in the Unity application layer.

This layer deploys Web View where it should expand across the entire screen.

### Layer 2: Web View

![Layer 2](/img/unity-react/layer-2.png)

The Web View layer is responsible for rendering the web content (React application). Since Web View imeplements Chromium engine it can render any web content. This layer sits inbetween Unity and React and initialises the React application.

Web View should be implemented to be responsive and stetch the full size of the application viewport. It's z-index should be the topmost so that so React can be rendered on top of the Unity application.

Since it's a Chromium implementation, things like the Window object is available to the React application. This means that the React application can communicate with the Unity application through the Window object (more on this will follow).

### Layer 3: React Application

![Layer 3](/img/unity-react/layer-3.png)

The React application is the top layer of the architecture. It contains all of the business logic and data access logic. The React application communicates with the other layers through a set of interfaces, which are defined in the React application layer.

### Bringing it all together

***[TODO] update this diagram to show all the interactions between layers and describe it***

![All Layers](/img/unity-react/layer-all.png)

## JS API Perspectives

The JS API is a set of interfaces that allow the Unity to communicate with the React and vice-versa.


### Unity Perspective

From a Unity perspective, the JS API is a set of interfaces that allow Unity to communicate with React and vice-versa. The JS API is implemented as a set of C# classes that are exposed to the Unity application through a set of interfaces. These interfaces define the methods that can be called by the Unity application and the events that can be sent to the React application.

The Unity layer is responsible for implementing the JS API with a set of predefined events. Each event has a `command` and optional `payload`. The `command` is a string that identifies the event type. The `payload` is an object that contains additional information about the event.

An example of Unity sending an event to React would look like:

```ts
{
  command: '3dModelLoaded',
  payload: {
    name: 'PerthCity',
    radius: 1000
  }
}
```

An example of Unity receiving an event from React would look like:

```ts
{
  command: 'onLoad',
  payload: {
    version: '1.0.0',
    state: 'ready'
  }
}
```

Notice how both are being represented as JSON objects. This is because the JS API is designed to be used with JSON. This makes it easy for developers to work with the JS API since they don't have to worry about converting data types or serializing/deserializing objects.

### React Perspective

Like Unity's implementation, React also needs to implement its own event handlers to be able to both send and receive events to and from Unity.

Following the Unity example of sending an event to let Unity know the React app has initialised, it'll look like something like this:

```ts 
const handleOnLoad = () => {
  window.Unity.sendMessage('onLoad', {
    version: '1.0.0',
    state: 'ready'
  });
}
```

Notice that the `window.Unity` object is used to send the message. This is the same object that Unity uses to send messages to React. This means that both Unity and React can communicate with each other through the `window.Unity` object (aka JS API bridge).

An example of receiving an event from Unity would be:

```ts
window.Unity.onMessage((event) => {
  switch (event.command) {
    case "3dModelLoaded":
      console.log(event.payload);
      break;
    default:
      break;
  }
});
```

The `onMessage` method takes a callback function as an argument. This callback function will be called whenever an event is sent from Unity. The event object contains information about the event such as the command and payload. It's up to the developer to decide what to do with this information.

## Lifecycle of Events

1. Unity application is loaded
2. Unity application initialises Web View
3. Web View loads React application
4. React application initialises
5. React application sends `onLoad` event to Unity
6. Unity application receives `onLoad` event from React
7. Unity application sends `3dModelLoaded` event to React
8. React application receives `3dModelLoaded` event from Unity
...
9. User interacts with React application, sending events to Unity
10. Unity application receives events from React and updates the scene accordingly; and so on.

***[TODO] Convert this to a flow diagram???***

***[TODO] Provide code snippets on how to implement the event handlers in both Unity and React???***

***[TODO] Talk about how Authentication fits into this puzzle???***

## Conclusion

Splitting the application into layers allows us to separate concerns and make it easier to maintain and extend the application in the future. It also makes it easier to test each layer individually, which can be useful when debugging issues or adding new features.


---

If you're interested in learning more about how we can help with your project, please [get in touch](https://www.mechanicalrock.io/lets-get-started)!

![Mechanical Rock Logo](/img/mr-logo-dark-landscape.jpg)

<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->
