---
layout: post
title:  "PWA Cache me if you can"
date:   2020-02-06
tags: PWA react
author: Natalie Laing
image: img/code.jpg
---


### What is a PWA anyway?

> This morning I went to write an article outlining a few tips about implementing a progressive web app (PWA). But when I went to introduce the topic, I again encountered what was the hardest part about the whole topic in the first place: I have a really hard time describing what a progressive web app actually is.


![in the feels](/img/blog/pwa/feels.jpeg)

The term PWA was coined in 2015, by designer Frances Berriman and Google Chrome engineer Alex Russell. 

To create a PWA you are going to need a service worker. A service worker is a script that is run in the background and acts as a network proxy between your app and the server to deliver that efficient caching strategy and offline capability PWA's are known for. 
Your request will go to your service worker, the service worker will check if what you are requesting is available in the cache. If it can extract the request data from the cache it will otherwise it will send the request to the server.

 PWA will require a manifest file that details how the app should behave when installed such as what name and icon will be displayed to the user.

![service worker](/img/blog/pwa/service-worker.png)

### But why do I need one? 

Handy checklist:

* **Do you require offline access?** 
    * You can cache important assets and serve them to the user to view when they are offline or have poor internet connection.
    * So your app requires users to upload files or images but they lose connection, your PWA can save those files locally and send them to the server once you reconnect to the internet.

* **Is security important?**
    * a requirement of PWA's is they must be served over https.

* **Do you want faster load times?**
    * Do you care about your users? then load times will be extremely important to keep your users on your PWA.
    * You want that high-performance audit score.

* **Do you want your users to be able to install your PWA to their home screen?**

**What are the pros and cons**


| Pros                                        | Cons          | 
| --------------------------------------------|:-------------:|
| Faster lead times, your time to production can be measured in minutes in comparison to a native app which required app store reviews | IOS support is limited |
| Deploy Multiple times per day| |
| Time to recovery can be measured in hours apposed to days |  |
|Development is much faster with the ability to produce MVP in 4 - 12 weeks|  |
|Fast feedback loops| | 
|Integration with your device hardware| | 
|Offline capability| | 
|install your app to your home screen as apposed to finding and downloading it from an app store | | 

### Getting started

```js
 npx create-react-app my-app-name --template typescript —use-npm
```
We are going to run the create react app script with a typescript template and using npm. Replace my-app-name with the name of your app. This will set up your directory with all the juicy things you are going to need to create a PWA.

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
  var cacheWhitelist = ['wms-pwa'];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

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
By using an effective caching strategy you can reduce subsequent load times. So instead of your request going over the network, the request can be retrieved from your local cache.  
It is worth noting that you can implement server-side or client-side caching. I will be focusing on client-side caching on the browser.

Server-side caching would be useful in the following use case:
You are implementing a house sales PWA. When the user selects their shortlist items you can have the main images cached because you know the user is going to want to look at their shortlist items.

I used workbox for caching, to start using workbox I added the following to my sw.js file

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
    addBtn.style.display = 'block';
  
    addBtn.addEventListener('click', (e) => {
      // hide our user interface that shows our A2HS button
      addBtn.style.display = 'none';
      // Show the prompt
      deferredPrompt.prompt();
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
}
```

## Going Offline

You can detect when your user is offline and display push notifications so the user is aware that they are no longer connected to the internet. 
In my example below I was trying to take a photo when I lost internet connectivity, as my page was cached I was not navigated away from my page but notified that the image I had taken would be saved locally until I reconnected to the internet. Yes, I did put my thumb over the camera because you don't want to see my face.

![offline](/img/blog/pwa/offline.png)


### Wrapping up

![audit](/img/blog/pwa/audit.png)

If you think we can help you set up a PWA, feel free to [contact-us](https://www.mechanicalrock.io/lets-get-started).

We will be at [ReactConf](https://reactconfau.com/), come say hi.

### References

* [https://knowyourmeme.com/photos/557213-feels](https://knowyourmeme.com/photos/557213-feels)
* [https://create-react-app.dev/docs/making-a-progressive-web-app/](https://create-react-app.dev/docs/making-a-progressive-web-app/)
* Halpern, B. (2020). What the heck is a "Progressive Web App"? Seriously. - DEV Community 👩‍💻👨‍💻. [online] Dev.to. Available at: https://dev.to/ben/what-the-heck-is-a-progressive-web-app-seriously-923 [Accessed 7 Feb. 2020].
[https://dev.to/ben/what-the-heck-is-a-progressive-web-app-seriously-923](https://dev.to/ben/what-the-heck-is-a-progressive-web-app-seriously-923)
* [https://medium.com/@chinmaya.cp/custom-service-worker-in-cra-create-react-app-3b401d24b875](https://medium.com/@chinmaya.cp/custom-service-worker-in-cra-create-react-app-3b401d24b875)

### Further Reading
* [https://medium.com/izettle-engineering/beginners-guide-to-web-push-notifications-using-service-workers-cb3474a17679](https://medium.com/izettle-engineering/beginners-guide-to-web-push-notifications-using-service-workers-cb3474a17679)
* [https://greenspector.com/en/articles/2017-11-21-is-twitter-lite-really-that-lite-for-your-battery-life/](https://greenspector.com/en/articles/2017-11-21-is-twitter-lite-really-that-lite-for-your-battery-life/)
* [https://serviceworkies.com](https://serviceworkies.com)
