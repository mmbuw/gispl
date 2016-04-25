# Implementation overview

As already mentioned, for some kind of an input to be recognized as a gesture, we can break down the work into roughly three steps:

* defining what a gesture is -- this is GISpL as a definition language

* recognizing input as a defined gesture -- this is what GISpL.js mainly does

* performing an action based on a recognized gesture -- this is the responsibility of the user implementing a gesture

Although the most important part of GISpL.js is to recognize user input as a gesture, it also needs to be able to accept gesture definitions, and to allow a user to assign a gesture action. The first part is not difficult because GISpL uses JSON as a definition language, and as described by the JSON author, JSON is just a subset of JavaScript [@jsonrfc]. Therefore, parsing JSON is trivial, and additionally it is not even necessary for a definition to be in JSON format; a simple JavaScript object is suitable as well.

For the last part, GISpL.js was designed and built in a way that is typical for JavaScript and the browser. Actions based on user input are usually assigned as callback functions or listeners for a particular event. For instance, every page node, e.g. an html tag, inherits from EventTarget [@eventtarget] and thus contains `addEventListener` and similar methods which can be used to assign actions based on user clicks, mouse movement, scroll etc. Libraries such as jQuery have further simplified this by using simple `on` and `off` methods that can assign built in and custom events to page elements.

GISpL.js draws inspiration from jQuery and many other libraries by defining a gispl object that contains a collection or list of elements (so called array-like objects). Additionally, the gispl object contains `on` and `off` methods to add callback functions to the elements in the collection, with the events in this case representing gestures. As shown in Figure {@fig:overview}, a user is responsible for defining a gesture according to the GISpL specification that is plugged into GISpL.js; it also needs to specify the elements for the gesture and and action, or actions, that will be executed once the gesture is recognized; GISpL.js will take care of recognizing user input and executing all of the defined actions for a particular element.

![High level overview of how GISpL.js works](./figures/overview.png){#fig:overview}

Reusing the gesture definition example from the [Introduction](#introduction), a user could implement a gesture as follows:

```
var twoFingeredMotion = {
    name: "two-fingered-motion",
    features: [
        {type: "Motion"},
        {type": Count, constraints: [2,2]}
    ]
};

gispl.addGesture(twoFingeredMotion);

gispl('img').on(twoFingeredMotion.name, function () {
    console.log('two fingered motion over an image');
});
```

In this simple example, once a two-fingered motion gesture over any image on the page is recognized, a simple message stating this fact will be logged to the console.

## Extending Tuio.js
## Recognizing gestures
## From recognition to action
