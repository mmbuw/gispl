# Defining gestures and their actions

Up to this point, the user is able to define gestures, and to have them recognized based on specific input. What is missing is a way for the user to define what will happen once a gesture is recognized. As an example, a swipe gesture to the left or right very often results in some kind of movement; moving fingers towards or away each other usually results in content increasing or reducing its size. Altough GISpL defines e.g. a scale feature, it is up to the user implementing the feature to decide what will a gesture containing a scale feature result in.

To accomplish this, GISpL.js uses events, which means users can assign callback functions that get executed once a gesture is recognized. Event driven programming is a paradigm common in JavaScript; not only is it a part of the Document Object Model and thus implicitly viewed as a part of JavaScript, it has found its way to many other JavaScript libraries. As already mentioned, jQuery and even Tuio.js used by GISpL.js implement such a mechanism. The one big advantage of this approach is that GISpL.js can be used by any application, irrelevant of what it does and how it was designed. Similar to how gesture objects do not care which features they contain, as long as they can verify user input, GISpL.js does not care what the user defined callback functions do -- it is not importanc which other libraries they use, if they use animation, draw on canvas etc.

This chapter deals with how this part of GISpL.js was built, how it gets used, and what some additional things the user can accomplish are.

## Actions

As already mentioned, GISpL's notion of regions -- parts of the screen -- that are relevant for a gesture was modified in such a way that DOM nodes are viewed as regions. The requirement is then for GISpL.js to allow a user a way to select a node, or nodes, on which to define actions for gestures. Since GISpL.js was in this regard in general modelled according to jQuery, it follows the same approach.

A JavaScript object is denoted by `{}`, whereas an array by `[]`. However, JavaScript is flexible in that it is possible for objects to contain properties that are in essence indices. If an additional property `length` that indicates the number of elements in the object is present, we have a so called array-like object that can be iterated like an array, but does not contain any array specific methods such as `push` etc. GISpL.js uses this approach to create objects that will contain indexed nodes and on which the user will then be able to assign actions for gestures.

In short, where in jQuery we would use `jQuery(selection)` or `$(selection)`, with GISpL.js we use `gispl(selection)`. This returns an object which can assign gesture actions to the nodes. But before this, we must first define what a `selection` is. It is possible to pass in:

* a single element, e.g. `gispl(document)` will wrap a gispl object around the root `document` node
* an iterable collection
    * `HTMLCollection` when retrieving nodes with native JavaScript methods
    * jQuery object or similar
* selection string, e.g. `gispl('img')` will wrap a gispl object around all images present in the page

This too is similar to the way jQuery works. At this point there is maybe a question of why not use jQuery directly. Although this does make sense in a way, jQuery is also a large library that takes care of many things, including AJAX or animations. Additionally, there are other libraries that do similar work and including jQuery would require the user to potentially include multiple libraries where one is sufficient. It would've been interesting to allow a user to replace this part of GISpL.js with jQuery (or something else), but this was in the end left out.

## Built in gestures