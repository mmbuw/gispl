# Validating input as gesture

The process of taking user input and validating it as a user defined gesture is the most important part of the GISpL.js library. It consists of:

* validating the gesture's set of features
* keeping track of which page elements receive the gesture based on gesture flags
* potentially manipulating user input based on gesture options such as duration etc.

A brief overview of how this process works was given in [Recognizing gestures](#recognizing-gestures), and this chapter will cover it in more detail. Specifically, it covers what happens with user input once it reaches a gesture object.

Every user defined gesture is stored as a gesture object. The gesture object contains a `load` method that gets called with user input as an argument, and it either validates the gesture or not. In its core, the gesture object simply delegates the input information to its features. The feature object also contains a `load` methods and it reports to the gesture if the input satisifes the conditions of the feature. As an example, user input that is represented by either just one point, or several points with the same coordinates will never satisfy conditions of the `Motion` feature, as it represents user input that does not move. Expanding on Figure {@fig:userinput}, we see in Figure {@fig:gesture} what happens with user input once it gets processed by `tuioInput`. Once a gesture is validated, this information is passed to the events object, which is a special object that deals with locating actions for gestures and nodes they are emitted on. It will be discussed in more detail in the next chapter.

![Input is submitted to gesture objects which validate the gesture](./figures/gesture.png){#fig:gesture}

The types of features available are defined by the GISpL specification, and were introduced in their own chapter. However, similar to the original implementation, GISpL.js does not care which features a gesture contains. Once a gesture has been added without errors -- meaning the definition that includes the feature is valid -- it only cares if its feature objects return `true` or `false`. As a consequence, GISpL.js as a library is easily extensible with new features if GISpL as a specification gets extended with additional features in the future.

Features represent a core element of a defined gesture [@gisplweb], but the GISpL specification defines other control methods.

## Flags

Flags are one such control method. The key value of a gesture flag is that it can adjust where the gesture event gets triggered. Normally, the element where the input is placed at the time when the gesture is recognized will also receive the gesture event. Flags allow us to change this behavior; there are three types of flags: `oneshot`, `sticky`, `bubble`. The behavior of the flags is defined in the specification, but it is important to note that of the three types, `bubble` is the one that can potentially cause a gesture event to be triggered on multiple page nodes.

Since the gesture definition itself and subsequently the gesture object contains the flag information, it was the logical place in GISpL.js for deciding how specific flags affect behavior. More simply put, this means that the gesture object's `load` method returns a list of page nodes that are affected by the gesture. This is in contrast with the feature object's `load` method that returns a boolean value. It also means that when a gesture was not recognized, it will return an empty list.

Going back to the example from [Recognizing gestures](#recognizing-gestures), we see the changes in the code example below.

```
nodesInput.forEach(function forAllNodes(inputObjects, node) {
    userDefinedGestures.forEach(function forAllGestures(gesture) {
        let nodes = gesture.load(inputObjects),
            eventName = gesture.name();
        // emit gesture on all relevant nodes
        nodes.forEach(function emitOnNodes(node) {
            events.emit(node, eventName);
        });
    });
});
```

## Duration
## Filters
