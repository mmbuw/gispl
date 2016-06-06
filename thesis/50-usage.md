# Usage

This chapter shows some typical use cases and their implementation. The [Implementation Overview](#implementation-overview) chapter showed one simple example, and this chapter will give some more detailed examples. Before this, it is important to mention some technical aspects of GISpL.js. It was built using some of the latest features defined in JavaScript or better said ECMAScript. Some of the additions defined in the ECMAScript 2015 specification and used in GISpL.js such as `WeakMap` have partial or full support in most modern browsers. Most, but not all. Although it is possible to polyfill [@polyfill] some features, GISpL.js will work best in the latest and most modern browsers. Additionally, the performance has been best in Chrome, but it works also in others such as Firefox or Safari.

## Examples

The most obvious example is using multi-point input to move, rotate, and scale images. It is also in essence relatively easy to implement. The different features can be implemented as separate gestures, and values can be applied as image transformations. The motion part is left out of the example because the translation transformation in CSS requires more work, and more space on the page.

```
gispl.addGesture({
    "name": "scaling",
    "features": [
        {"type": "Scale"}
    ]
});
gispl.addGesture({
    "name": "rotating",
    "features": [
        {"type": "Rotation"}
    ]
});

let images = document.getElementsByTagName('img');
// reference their current scale and rotation values
let imageRotations = new WeakMap(),
    imageScales = new WeakMap();

for (let i = 0; i < images.length; i += 1) {
    // initial scale is 1
    imageScales.set(images[i], 1);
    // initial angle is zero
    imageRotations.set(images[i], 0);
}

// transform images on gestures and store their values
gispl(images)
    .on('rotating', function fingerRotationCallback(event) {
        let rotation = event.featureValues.rotation.touches,
            degrees = rotation / Math.PI * 180;
        let previousDegrees = imageRotations.get(event.target);
        imageRotations.set(event.target, previousDegrees + degrees);
        requestDraw();
    })
    .on('scaling', function(event) {
        let scale = event.featureValues.scale;
        let previousScale = imageScales.get(event.target);
        imageScales.set(event.target, scale * previousScale);
        requestDraw();
    });
```

The `requestDraw` function is simple and takes care of applying the appropriate transformations. Since the usage is graphical, it consists of calling `requestAnimationFrame` if the previous call was completed.

Other interesting examples can be found in some non-graphical cases. For instance, deleting an element by using a path gesture. Figure {@fig:delete-gesture} a) demonstrates the path of the required gesture. The points can be supplied to the feature definition:

```
{
    "type": "Path", "constraints": [
        [0, 100],
        [100,0], 
        [0, 0],
        [100, 100]
    ]
}
```

![a) The path must contain at least the points 1, 2, 3, and 4
b) the path does not get recognized above the desired element
c) multiple elements can be selected](./figures/delete-gesture.jpeg){#fig:delete-gesture}

A flaw with this approach is that it is not guaranteed that the gesture will be recognized on the exact element we want to remove, as shown in Figure {@fig:delete-gesture} b). This is especially true if the image is relatively small. The problem can be solved by applying the `bubble` flag to the gesture. As a reminder, this flag forces the gesture to be triggered on all elements encountered by the input. The gesture will then trigger on an image if the input was even for a moment in contact with the element. This approach also works when we want to remove several elements at once, as shown in Figure {@fig:delete-gesture} c).

The possibilities are vast and other examples can be found on the GISpL website [@gisplweb], and in the GISpL.js repository [@gispljsrepo].

## pART bench

As a more real world example, we take a look at pART bench [@partbench], a student project on the Bauhaus-Universität. The goal of the project was to bring a gesture based interface to a tool previously developed. The core of the work was a user study, and the actual selection and development of gestures. The gestures themselves were therefore implemented in a more ad hoc way. What is interesting in relation to the GISpL.js project, is that it is not only about a gesture based interface, but the tools itself also used TUIO and its support for tangible objects. This makes it possible to implement some of pART bench gestures in GISpL. The gestures implement three types of metaphors named: stamp, washing machine, and square meters. Most of these can be implemented trivially in GISpL, at least with respect to the gesture definition.

Stamp was used to initialize some of the other actions, by placing a tangible object on the screen. In GISpL terms, it makes sense for this gesture to run only once, therefore the `oneshot` flag; also, because the object has a specific ID, it can be uniquely identified by it, e.g. `1` in the example case.

```
{
    "name: "stamp",
    "flags: "oneshot",
    "features: [
        {"type": "ObjectId", "constraints": [1, 1]}
    ]
}
```

Washing machine got its name because of a motion resembling rotating a knob on a washing machine. An obvious hint in GISpL terms is the word rotation; similarly to the stamp gesture, the tangibles dedicated for this gesture can be identified. In this case as a range, since there are several. The example uses numbers from `2` to `6`.

```
{
    "name: "washing-machine",
    "features: [
        {"type": "Rotation"},
        {"type": "ObjectId", "constraints": [2, 6]}
    ]
}
```

Square meters refers to using two separate tangible objects. Moving the right object diagonally to the top-right sets a value based on its distance from the left object. This gesture can be interpreted as scaling, with the constraint that the object to the right moves, and the other does not. This can be further set by using a constrained motion feature; the combined motion vector of both objects must therefore be placed in a box constrained by the points `1, 1` and `4, 4`. The objects can also be uniquely identified, like in the previous examples.

```
{
    "name: "square-meters",
    "features: [
        {"type": "Scale"},
        {"type": "Motion", "constraints": [[1, 1], [4, 4]]},
        {"type": "ObjectId", "constraints": [1, 2]}
    ]
}
```

It is also interesting that this gesture can be implemented in a slightly different way. Since we are interested in the distance between two grouped objects, it is possible to use the `ObjectGroup` feature. The number of objects is limited to two, and the allowed radius can be set to a very large number, so that this group is always valid.

```
{type: 'ObjectGroup', constraints: [2, 2, 100000]}
```

What remains is of course to implement an action for the appropriate gesture. This is application dependent, and in the case of pART bench meant that, e.g. a rotating knob increased or decreased a certain value. But once the basic gesture recognition works, this is likely the somewhat easier part.

## Issues

There are also unfortunately some issues with the GISpL.js implementation. Two, to be precise. The first example in this chapter dealt with usage in a more graphical context -- moving, rotating, and scaling an image across the browser viewport. The actual graphic part is broken down into two steps: collecting current scale, rotation etc. information, and then "drawing" the changes by applying CSS transformations to images. This approach works well, but only most of time.

![Google Chrome DevTools Timeline shows code execution and the state of the browser
a) a frame that took 24.5 ms is labeled as a "long frame"
b) a frame that took 281 ms is labeled as an "idle frame"](./figures/chrome-devtools.png){#fig:chrome-devtools}

Figure {@fig:chrome-devtools} shows two screenshots of the Google Chrome DevTools, specifically its Timeline section. The Timeline section can be used to capture most of the events that go on inside of the browser: layout changes, painting, user input, JavaScript execution etc. and to do this chronologically. It is also able to display important information such as how the changes that occurred, e.g. graphical changes, influenced the frame rate. We can see that the frame rate has most of the time been within limits of what can be called a smooth animation. Chrome also marks every frame for which it thinks it is taking too much time with a red triangle and a label of "long frame", as seen in Figure {@fig:chrome-devtools} a). Although there are usually plenty of frames Chrome considers too long, the real issue is in one of the really long frames, which can last from 200 to 500 milliseconds, which also often times take place for no apparent reason and randomly. On a more careful look, it can be observed that Chrome itself does not actually label this frame long; instead, it is labeled as an "idle frame", Figure {@fig:chrome-devtools} b). Looking further, it can also be seen that the actual GISpL.js code executes in a matter of milliseconds; it also sometimes keeps executing multiple times during this "idle frame". There was no documented explanation on the difference between the two frame types, other than a few hints that it might be related to the browser itself being busy. Also, the randomness of the problem contributed greatly to it not being solved. On the other hand, this problem showed up in this particular example, which is not the only case where GISpL.js could be used.

The second issue is less mysterious, and deals with the way GISpL.js processes user input, and how this collides with some parts of the GISpL specification. GISpL.js separates user input per nodes in order for it to be able to execute different gestures at basically the same time. For instance, moving different images simultaneously with different fingers works because the user input over each image is the only one relevant for that image. On the other hand, GISpL specifies gesture flags such as `sticky` that can modify which page node receives the gesture event. The `sticky` flag guarantees that a node will keep receiving the gesture event even though user input might not be in contact with it. It can happen that on a typically multi-point features such as rotation, the gesture fails to work as expected because user input was separated to several nodes, and it does not validate, even though the `sticky` flag should guarantee continuous gesture triggering. This problem is correctable, but at the time of the writing still exists.
