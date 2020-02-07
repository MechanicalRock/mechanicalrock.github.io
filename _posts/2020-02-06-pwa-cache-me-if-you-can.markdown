---
layout: post
title:  "PWA Cache me if you can"
date:   2020-02-06
tags: PWA react
author: Natalie Laing
image: img/code.jpg
---

### What is a PWA anyway?
This morning I went to write an article outlining a few tips about implementing a progressive web app (PWA). But when I went to introduce the topic, I again encountered what was the hardest part about the whole topic in the first place: I have a really hard time describing what a progressive web app actually is.[Ben Halpern of dev.to, in a post called “What the heck is a “Progressive Web App”? Seriously.” [Posted 11/06/2017, updated 04/21/2018]]

![in the feels](/img/blog/pwa/feels.jpeg)

### But why do I need one? 

Handy checklist:

* Do you require offline access? 
* Do you care about your users? 
* Is security important?
* Do you want faster load times?
* Do you want your users to be able to install your PWA to their home screen?

### Getting started

```js
 npx create-react-app my-app-name --template typescript —use-npm
```
We are going to run the create react app script with a typescript template and using npm. Replace my-app-name with the name of your app. This will set up your directory with all the jucy things you are going to need to create a PWA.

Navigate to the index.jsx file and register your service worker.
```js
serviceWorker.register();
```

Create a service worker file in the public folder, I have named mine sw.js
```js
// Name your cache and set the paths that you want to cache
var CACHE_NAME = 'my-pwa'; 
var urlsToCache = [
  '/',
  '/somePath'
];

// Install a service worker
self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});
// Cache and return requests
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
// Update a service worker
self.addEventListener('activate', event => {
  var cacheWhitelist = [‘my-pwa'];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);

```

In your index.html you want to register your service worker, point this to the service worker file you created in the above step.

```js
<script>
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('sw.js').then(function(registration) {
            console.log('Worker registration successful', registration.scope);
            }, function(err) {
            console.log('Worker registration failed', err);
            }).catch(function(err) {
            console.log(err);
            });
        });
    } else {
        console.log('Service Worker is not supported by browser.');
    }
</script>
```
Now you have the base that you will need to get started and you can build from here.

### Cache me if you can

Now you are ready to start caching the assets that matter to your use case.
I used workbox for caching, to start using work box i added the following to my sw.js file

```js
importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');
workbox.setConfig({debug: false}); 
workbox.precaching.precacheAndRoute([])

workbox.routing.registerRoute(
  /\.(?:png|jpg|jpeg|svg|gif)$/, //What image file types do you care about caching
  new workbox.strategies.CacheFirst({
    cacheName: 'image-cache',
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 20,
        maxAgeSeconds: 7 * 24 * 60 * 60,
      })
    ],
  })
);
```
Whilst you are testing your caching strategy you can ommit the following line of code. I highly reccomend that you add this in once you know your cache setup is working.
```js
workbox.setConfig({debug: false}); 
```

### A2HS [Add 2 Home Screen]

![A2HS](/img/blog/pwa/a2hs.png)

You can prompt the user to install your PWA to their home screen from their desktop or mobile device, this allows the user to use your PWA as if it was a native app.

```js
let deferredPrompt;
const addBtn = document.querySelector('.addButton') as HTMLElement;

if (addBtn) { 
addBtn.style.display = 'none';

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Update UI to notify the user they can add to home screen
    addBtn.style.display = 'block';
  
    addBtn.addEventListener('click', (e) => {
      // hide our user interface that shows our A2HS button
      addBtn.style.display = 'none';
      // Show the prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the A2HS prompt');
          } else {
            console.log('User dismissed the A2HS prompt');
          }
          deferredPrompt = null;
        });
    });
  });
```

### Wrapping up



If you think we can help you secure your API Gateways, feel free to [contact-us](https://www.mechanicalrock.io/lets-get-started).

### References

* [https://knowyourmeme.com/photos/557213-feels](https://knowyourmeme.com/photos/557213-feels)
* [https://create-react-app.dev/docs/making-a-progressive-web-app/](https://create-react-app.dev/docs/making-a-progressive-web-app/)

### Further Reading
* [https://medium.com/izettle-engineering/beginners-guide-to-web-push-notifications-using-service-workers-cb3474a17679](https://medium.com/izettle-engineering/beginners-guide-to-web-push-notifications-using-service-workers-cb3474a17679)
