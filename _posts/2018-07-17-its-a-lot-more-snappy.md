---
layout: post
title: "\"It's A Lot More Snappy\""
date: 2018-07-29
tags: pwa spa javascript
author: Rick Foxcroft
image: img/offline_logo.png
---

## _‘A real world application of PWA technology’_

Recently Mechanical Rock undertook the journey of building a progressive web app (PWA) for a client here in Perth. A PWA uses modern web capabilities to deliver a native app-like experience by providing offline support and resource caching. The application we were building needed to provide users the ability to raise issues on equipment in geographically isolated areas. Due to this isolation and unreliable networks, we decided to build a PWA so that previously fetched data could be stored locally on the device and the application could be used without a network connection and still serve data to the user.

Whilst building the app we encountered some performance issues. Over time the app would gradually become unresponsive to the point where it would take a few seconds to register a button click.

## What Was The Problem?

* The app had to deal with a large dataset. One of these datasets was an array of 205509 objects. Let’s refer to these objects as Pokemon.
* The list of Pokemon had to be used in several places throughout the app and in some places not all of the data pertaining to each Pokemon was used.
* A JSON file of this magnitude takes a fair amount of time to download. A simulation on a 1mb/s link reveals that this may take up to 3 minutes to download.

## The Solution:

* _Remove extraneous Data_ from the array and ensure this operation only happens once
* _Update IndexedDB on a background thread_, allowing the user to progress with other aspects of the application.
* _Improve the download speed of the data for slow networks_ by chunking requests in parallel _(beyond the scope of this post)_

## 1. Remove extraneous Data

```typescript
async function transformPokemon(): Promise<void> {
    for (let i = 0; i < this.pokemon.length; i++) {
        const pokemon = {
            value: this.pokemon[i].pokemonId,
            label: `${this.pokemon[i].pokemonId} - ${this.pokemon[i].shortDescription}`
        };
        this.pokemonOptions.push(pokemon);
    }
    await localforage.setItem(this.pokemonGroup, this.pokemonOptions);
}
```

Instead of storing the complete dataset in memory, we filtered several attributes for each object to only include the data necessary for the UI. We made sure the data mapping was performed once; when the UPDATE_POKEMON action was dispatched to our redux store. Performing data manipulation on this dataset during every render, would result in visible lag as the main thread might be blocked for a few seconds. You'll notice, we also store a copy of this transformed array so that we don't have to retrieve it over the network the next time. Which meant we could run the following when mounting our component.

```typescript
async function getPokemon(): Promise<AnyAction> {
    const pokemonDAO = new PokemonDAO(this.location);
    const localPokemonCount = await pokemonDAO.getCount();

    if (localPokemonCount > 0) {
        // The data has already been retrieved
        this.pokemonOptions = await localforage.getItem(this.pokemonGroup) as SelectOption[];
    } else {
        // Fetch the data and update IndexedDB
        const options = { method: 'GET' };
        this.pokemon = await new NetworkCall(this.endpoint, options).makeRequest() as Pokemon[];
        this.spawnWorker();
        await this.transformPokemon();
    }
    return this.buildUpdateAction();
}
```

## 2. Create a seperate thread in the background

Before we completed the above step, we decided to do something a little less obvious that would eventually aid us in our quest to build an offline web app. We decided to create a local database of all the Pokemon retrieved from the network, in IndexedDB. In case you don’t know, IndexedDB is a native browser API that is supported by most modern browsers.

When it came to inserting the data into a table in IndexedDB, we found that the native javascript/browser IndexedDB API was cumbersome and unintuitive. We chose to use a wrapper called [dexie](https://www.npmjs.com/package/dexie) on NPM. Dexie also allowed us to perform bulk put operations on our IndexedDB tables. Dexie's bulk put operation offers an increase in performance by opting out of listening to onSuccess callbacks for each put operation.

_the magic runes:_

```typescript
async function updatePokemon(): Promise<void> {
    const pokemonLength = this.pokemon.length;
    let partitionStart = 0;
    let partitionEnd = 0;

    await this.db.transaction('rw', this.table, async (): Promise<void> => {
        while (partitionStart < pokemonLength) {

            const sizeDifference = pokemonLength - partitionEnd;

            if (sizeDifference < this.partitionSize) {
                partitionEnd += sizeDifference;
            } else {
                partitionEnd += this.partitionSize;
            }

            const partition = this.pokemon.slice(partitionStart, partitionEnd);
            await this.table.bulkPut(partition);
            partitionStart = partitionEnd;
        }
    });
}
```

Now that we had implemented this pattern, we noticed that the initial download of the data was taking much longer than it had previously. We were still downloading the dataset in the same way, performing a mapping operation on the dataset before storing it in our redux store and then inserting all of our newly obtained Pokemon into our Pokemon DB. If only there existed a method, which could enable us to parallelise these operations.

It was at this point our fearless tech lead, William Sia(TM) proposed using a web worker for that exact purpose. This was new and exciting, as well as a great fit for the problem we needed to solve.

We decieded to implement a web worker and chose a module called [worker-loader](https://www.npmjs.com/package/worker-loader) which seamlessly integrated with our current build and packaging eco-system. In fact, worker-loader almost made it inconceivable that we waited such a long time to implement our first web worker. We didn’t even need to add any additional config to our web pack config files.

When using a web worker, all that's needed to get things started is:

* initialise the worker
* post a message to the worker (preferably as a string)
* create a callback for when the worker completes

_from the main thread:_

```typescript
function spawnWorker(): void {
    const bulkPutWorker = new Worker();
    bulkPutWorker.postMessage(JSON.stringify({ pokemon: this.pokemon, location: this.location }));
    pokemonActions.startInsertingPokemon();
    window.addEventListener('pokemonUpdated', pokemonActions.endInsertingPokemon);
    bulkPutWorker.onmessage = (event: MessageEvent): void => {
        window.dispatchEvent(new Event(event.data));
    };
}
```

_within the worker:_

```typescript
worker.onmessage = async (event: MessageEvent): Promise<void> => {

    const { location, pokemon } = JSON.parse(event.data) as BulkPutEvent;
    const pokemonUpdater = new PokemonUpdater(location, pokemon);
    try {
        await pokemonUpdater.updatePokemon();
    } catch (error) {
        console.log('Something has gone awry', error);
    }
    worker.postMessage('pokemonUpdated');
    self.close();
};
```

Profiling the app before and after the changes revealed that using a background process increased the max heap size by 20mb. Even though memory usage increased, the benefit of implementing the web worker was that we could now offload the computationally expensive task of writing all this data to IndexedDB. The user can now continue on the main thread and the app will remain responsive without any noticeable decrease in responsiveness over time.

Using PWA technology enabled us to deliver a solution that would have otherwise not been possible with a conventional web app. Storing this data in IndexedDB means, offline usage is now possible and subsequent loads of the dataset are no longer a concern at all because the data can be accessed instantly from the local store. Having noticed these improvements, our client said “After testing the app, it’s now a lot more snappy!”
