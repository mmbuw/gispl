# Validating input as gesture

The process of taking user input and validating it as a user defined gesture is the most important part of the GISpL.js library. It consists of:

* validating the gesture's set of features
* potentially manipulating user input based on gesture options such as duration etc.
* keeping track of which page elements receive the gesture based on gesture flags

A brief overview of how this process works was given in [Recognizing gestures](#recognizing-gestures), and this chapter will cover it in more detail. Specifically, it covers what happens with user input once it reaches a gesture object.

Every user defined gesture is stored as a gesture object. The gesture object contains a `load` method that gets called with user input as an argument, and it either validates the gesture or not. In its core, the gesture object simply delegates the input information to its features. The feature object also contains a `load` methods and it reports to the gesture if the input satisifes the conditions of the feature. As an example, user input that is represented by either just one point, or several points with the same coordinates will never satisfy conditions of the `Motion` feature, as it represents user input that does not move. Expanding on Figure {@fig:userinput}, we see in Figure {@fig:gesture} what happens with user input once it gets processed by `tuioInput`. Once a gesture is validated, this information is passed to the events object, which is a special object that deals with locating actions for gestures and nodes they are emitted on. It will be discussed in more detail in the next chapter.

![](./figures/gesture.png){#fig:gesture}

The types of features available are defined by the GISpL specification, and were introduced in their own chapter. However, similar to the original implementation, GISpL.js does not care which features a gesture contains. Once a gesture has been added without errors -- meaning the definition that includes the feature is valid -- it only cares if its feature objects return `true` or `false`. As a consequence, GISpL.js as a library is easily extensible with new features if GISpL as a specification gets extended with additional features.

## Flags
## Duration
## Filters
