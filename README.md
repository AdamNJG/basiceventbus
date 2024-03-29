# 2.0 changes!
version 2.0 makes changes that will break any uses of getSubscriptions(), although this method has not been previously mentioned in this document, as it is included in the API of EventBus only for testing purposes, and now outputs a typed Key-Value object, with the topic as the key and a set of delegates as the value.

Version 2.0 does bring optimisations however. Subscribing 10000 delegate functions to a single topic previously took an unacceptably long time to excecute (around 70 seconds), 2.0 brings the time to do this down to 7ms, and Subscribing 1000000 delegate functions on a single topic call to around 300ms (not that you would need to, but its nice to know you can!).

There are plans for middleware support for adding delegate functions that run on every subscribe, emit, unsubscribe and reset.

# Basic Event Bus

This is a simple package that implements an event bus for use in manipulating the DOM.

This is currently in beta, if you have any feeback drop me an email at: anjgoldsmith@gmail.com.

I do plan on adding extra modules to new NPM packages that will allow the forwarding of messages from event buses such as SingalR, if you have any suggestions, please let me know.

## Importing

To get started (after install) just import the library:

```
import {EventBus} from 'basiceventbus';
```

or

```
const {EventBus} = require('basiceventbus');
```

## Getting an instance of EventBus

To get in instance of EventBus you must call the getInstance() method, the instance is a singleton.

```
var eventBus = EventBus.getInstance();
```

## Subscribing to a Topic

The Subscibe method allows you to subscribe to a topic, taking the name of the topic in the form of a string and a (callback) function to run when the topic is published to with new a new messasge/data.

**Note**: It is best to declare a function before passing it to the Subscribe method, as annonymous functions do not get caught in the duplication logic and my cause side effects. Although multiple different functions can obviously be applied to a single topic, through multiple subscriptions.

**Note**: Multi argument functions are also supported, see "Publishing to a Topic" for details on passing the arguments.

```
let func = (data) => {console.log(data)}; // Single argument function
let func2 = (data, data2) => {console.log(data + data2)}; // Multi argument function

eventBus.subscribe('topic', func);
eventBus.subscribe('topic', func2);
```

## Publishing to a Topic

The Emit method allows you to send a message with data (it has an any typing), this takes the Topic name, and any ammount of arguments.

**Note** To pass multiple arguments, you just list them after the first agument.

```
eventBus.emit('topic', 25); // Single argument emit
eventBus.emit('topic', 25, 10, 50); // Multi argument emit
```

## Unsubscribing from a Topic

The Unsubscribe method allows you to remove a specific function from a topic that has already been subscribed, you can also remove all subscriptions from a given topic by just passing the topic name to unsubscribe.

```
eventBus.unsubscribe('topic', func);
eventBus.unsubscribe('topic');
```

## Resetting the EventBus

The Reset function clears out all of the previously subscribed events

```
eventBus.reset();
```
