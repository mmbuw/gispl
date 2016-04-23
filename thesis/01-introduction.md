# Introduction

Touchscreens have in the last decade, with the rise in popularity of smartphones, become one of the most common ways of interaction with machines. Interacting with a touchscreen based device is in some ways similar to using hardware such as a mouse -- e.g. for a double click there could be a double tap -- but it is usually more sophisticated. Gestures such as swipe or pinch have become as self explanatory as using a scroll wheel, and are often described as a natural way to interact with a computer.

From the view of someone who should define and implement a gesture however, it is also a bit more than that. It would consist of at least defining what a gesture is and what kind of an input makes up a valid gesture, finding a way to notify the application in use that a gesture had occurred, and finally performing an action that corresponds to the gesture.

Modern devices, for instance ones running Apple's iOS have built in support for well known gestures, but also support custom gestures. As an example, to define a custom gesture, developers for iOS need to extend the `UIGestureRecognizer` class and implement the following methods:
    
    (void)touchesBegan:(NSSet *)touches withEvent:(UIEvent *)event;
    (void)touchesMoved:(NSSet *)touches withEvent:(UIEvent *)event;
    (void)touchesEnded:(NSSet *)touches withEvent:(UIEvent *)event;
    (void)touchesCancelled:(NSSet *)touches withEvent:(UIEvent *)event;

Despite accomplishing only the first step of defining how a gesture should work, it is already very technical and definitely not trivial. There is a bigger issue however, and that is that the gesture will -- in this case -- work only on an iOS device. If, for instance, the same gesture would need to work on a different device, it would need to be implemented separately again, if at all possible.

**Gestural Interface Specification Language**, or in short **GISpL**, takes a different approach to this issue. It represents a gesture definition language that could theoretically be implemented on any device with any source as input. The language itself solves the problem of defining and recognizing a gesture by breaking a gesture down into specific features that describe it; features like motion, count, rotation or scale [@gispl]. This allows the users to define their own specific gestures by combining and adjusting a specific set of features. As an example, say we want to define a two-fingered motion of any kind - in GISpL, the main part of the definition would be as simple as:

    "features": [
        {"type": "Motion"},
        {"type": "Count", "constraints": [2,2]}
    ]

In this case we are defining a gesture as any kind of motion and exactly two separate input objects (e.g. fingers). Once user input matches the specified set of features, the gesture is recognized. Of course, for it to be possible to use simple definitions like the one above, GISpL itself needs to be supported on a device or simply inside of an application, and exactly that is the goal of this work. Prior to this, GISpL was implemented in C++ as part of the TISCH Framework  and was made to work with a variety of input devices [@tisch]. This work deals with implementing GISpL in JavaScript, in order for it to work within a web browser. In some cases this means implementing the specification as-is, and in others adapting it to make it better work within the constraints of the browser. Additionally, along with recognizing gestures based on user input, it also deals with implementing a simple way of allowing the users to define their own gesture based behavior.
