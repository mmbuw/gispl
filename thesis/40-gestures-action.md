# Defining gestures and their actions

Up to this point, the user is able to define gestures, and to have them recognized based on specific input. What is missing is a way for the user to define what will happen once a gesture is recognized. As an example, a swipe gesture to the left or right very often results in some kind of movement; moving fingers towards or away each other usually results in content increasing or reducing its size, aka scaling. Altough GISpL defines e.g. a scale feature, it is up to the user implementing the feature to decide what will a gesture containing a scale feature result in.

To accomplish this, GISpL.js uses events, which means users can assign callback functions that get executed once a gesture is recognized. Event driven programming is a paradigm common in JavaScript; not only is it a part of the Document Object Model and thus implicitly viewed as a part of JavaScript, it has found its way to many other JavaScript libraries. As already mentioned, jQuery and even Tuio.js used by GISpL.js implement such a mechanism. The one big advantage of this approach is that GISpL.js can be used by an application, irrelevant of what it does and how it was designed. Similar to how gesture objects do not care which features they contain, as long as they can verify user input, GISpL.js does not care what the user defined callback functions do -- it is not important which other libraries they use, if they use animation, draw on canvas etc. This also means that GISpL.js does not prevent the user from using a scaling motion to do other actions other than actually adjust size. 

This chapter deals with how this part of GISpL.js was built, how it gets used, and what some additional things the user can accomplish are.

## Adding actions

As already mentioned, GISpL's notion of regions -- parts of the screen -- that are relevant for a gesture was modified in such a way that DOM nodes are viewed as regions. The requirement is then for GISpL.js to allow a user a way to select a node, or nodes, on which to define actions for gestures. Since GISpL.js was in this regard in general modelled according to jQuery, it follows the same approach.

A JavaScript object is denoted by `{}`, whereas an array by `[]`. However, JavaScript is flexible in that it is possible for objects to contain properties that are in essence indices. If an additional property `length` that indicates the number of elements in the object is present, we have a so called array-like object that can be iterated like an array, but does not contain any array specific methods such as `push` etc. GISpL.js uses this approach to create objects that will contain indexed nodes and on which the user will then be able to assign actions for gestures.

In short, where in jQuery we would use `jQuery(selection)` or `$(selection)`, with GISpL.js we use `gispl(selection)`. This returns an object which can assign gesture actions to the nodes. But before this, we must first define what a `selection` is. It is possible to pass in:

* a single node, e.g. `gispl(document)` will wrap a gispl object around the root `document` node
* an iterable collection of nodes
    * proper `Array`
    * `HTMLCollection` when retrieving nodes with native JavaScript methods
    * jQuery object or similar
* selection string, e.g. `gispl('img')` will wrap a gispl object around all images present in the page

This too is similar to the way jQuery works. At this point there is maybe a question of why not use jQuery directly. Although this does make sense in a way, jQuery is also a large library that takes care of many things, including AJAX, animations etc. Additionally, there are other libraries that do similar work and including jQuery would require the user to potentially include multiple libraries where one is sufficient. It would've been interesting to allow a user to replace this part of GISpL.js with jQuery (or something else), but this was in the end left out.

Once a gispl object exists, it can be used to assign actions with the `on` method (and remove actions with the `off` method). The `on` method takes two arguments, the gesture `name` and the `callback`. From the view of the user, it does not need to do anything else. Of course, GISpL.js needs to save the callback, retreive, and execute it when needed.

## Executing actions
The `events` object was mentioned briefly in [Validating input as gesture](#validating-input-as-gesture). Once a gesture is recognized on a node, the `event` object is capable of locating the registered callbacks for the node and the gesture. It retrieves them from where they are store -- the `eventCache` object, a `WeakMap` which is a new data structure added in the EcmaScript 2015 standard. As a map, it holds key and value pairs, and the reason for the name is that it accepts objects as keys and references them "weakly". This means that the map itself does not reference the object in a way that would prevent garbage collection. The advantage of this is that DOM nodes can be safely used as keys, and if they are deleted and removed, the fact that the node is contained inside of the `eventCache` does not prevent it from being garbage collected, along with the values. This drastically reduced the complexity of storing callbacks.

The `eventCache` contains key-value pairs with DOM nodes as keys. The value is another `Map` with gesture names as keys, and an array of callbacks as value. So a gesture recognized on a node results in:

1) lookup in the `eventCache` for the registered gestures on the node
2) lookup for the registered callbacks for the one specific gesture

Once the callbacks are located, they are all executed. Since the callbacks are stored in an array, it is implicit that the order in which they are added is important. For instance, `function1` will be executed before `function2` in the code below.

```
gispl(document).on('example-gesture', function1);
gispl(document).on('example-gesture', function2);
```

Putting it all together, the above code will add two callbacks for a previously registered gesture with the name of `example-gesture` for the `document` node, which will be executed once the gesture is recognized.

## Event object

## Built in gestures
