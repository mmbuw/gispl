# GISpL

This chapter gives a brief overview of GISpL, the ideas and specification behind it. At its core, the Gestural Interface Specification Language allows a user to define a gesture by merely specifying of what kind of features it should consist of, and then relying on the underneath GISpL implementation to validate future user input. This is decribed in [@gispl]:

>GISpL is a formal language which allows both researchers and developers to unambiguously describe the behavior of a wide range of gestural interfaces using a simple JSON-based syntax. GISpL supports a multitude of input modalities, including multi-touch, digital pens, multiple regular
mice, tangible interfaces or mid-air gestures. GISpL introduces a novel view on gestural interfaces from a software-engineering perspective. By using GISpL, developers can avoid tedious tasks such as reimplementing the same gesture recognition algorithms over and over again. Researchers benefit from the ability to quickly reconfigur prototypes of gestural UIs on-the-fly, possibly even in the middle of an expert review

Instead of implementing a gesture for a specific technology, e.g. smartphone device, one can define a gesture using GISpL and this gesture will then be recognized on any device that supports the language. GISpL.js, a JavaScript library and the topic of this work, is an attempt to allow this language to be used inside of a browser. Although a browser is not a device, JavaScript based applications for the browser are increasingly being written, and there is therefore interest for an easier way to bring gestures to the browser.

## Defining a gesture

The opening paragraph already uses the word features. **Features** are the most important building block of a GISpL defined gesture. Once the implementer breaks down a gesture into possible features, user input can be validated as a defined gesture. As an example, how one could select festures for a motion based gesture in GISpL:

```
"features": [
    {
        "type": "Motion"
    }
]
```

This gesture will recognize any user input that is simply moving. But what if the gesture then needs to be modified for it to now work with two input points, e.g. fingers?

```
"features": [
    {
        "type": "Motion"
    },
    {
        "type": "Count",
        "constraints": [2, 2] 
    }
]
```

Simply adding a second feature was enough to modify the gesture, and have it in other ways work as it did before. This examples also shows how GISpL in essence works: a gesture is valid, if user input satisfies all the features specified in the gesture. In total, GISpL in its current form specifies 11 features, two of which we already saw. The features allow for futher configuration by specifying constraints, which then forces a feature to additionally match the constraints.

**Count** is probably the simplest feature, as it only checks the number of input points. In contrast to some other features, the usage of constraints is mandatory, as it defines the lower and upper bound of input points.

**Motion** checks if user input is in fact moving. The constraints can further allow for this motion to be directed; the two points in the constraints form a box. The average motion vector of all input points [@gispl] then needs to be constrained within this box.

The table from [@gispl] sumarizes all of the features.

------------------------------------------------------------------------------------------------------------
Name        Type        Unit            Constraints         Description
----------- ----------- --------------- ------------------- ------------------------------------------------
Count       Integer     dimensionless   lower/upper bound   Number of input objects in region (e.g. number
                                                            of touch contact points)

Motion      Float       seconds         lower/upper bound   Duration since last change in input object set                                                                  (e.g., seconds since last touch contact entered
                                                            region)

Path        Float       dimensionless   template path       Accuracy of match between template path and
                                                            actual path travelled by input objects

Motion      Vector      TUIO units / s  lower/upper bound   Average motion vector of all input objects 
                                                            in region

Rotation    Float       rad             lower/upper bound   Relative rotation of the input objects with
                                                            respect to their starting positions

Scale       Float                       lower/upper bound   Relative size change of input objects with
                                                            respect to their starting positions

Position    Vector      TUIO units      bounding box        Positions of all individual input objects (e.g
                                                            all tangible objects within region)

ID          Integer     Object ID       lower/upper bound   Numerical IDs of input objects (e.g. for 
                                                            identification of tagged tangible objects)

ParentID    Integer     Object ID       lower/upper bound   Numerical IDs of parent objects for
                                                            parent-child relation (e.g. for recognition of 
                                                            hand and matching fingers)

Dimensions  Vector      TUIO units      lower/upper bound   Physical dimensions of objects as described by
            triple                                          equivalent ellipse (e.g. for matching objects
                                                            of certain shape)

Group       Integer     TUIO units      min/max             Group of input objects as specified by minimum
                                        group radius        & maximum radius of group (e.g. for matching
                                                            groups of closely spaced touched points)
-------------------------------------------------------------------------------------------------------------

There are several other options other than features that allow more control over a GISpL defined gesture. But before that, it is also necessary to mention GISpL's definition of regions. A region acts as a specific area where gestures are defined. As stated in [@gisplweb], regions:

>...define spatial areas in which a certain set of gestures is valid and which capture motion data that falls within their boundaries.

One of additional options are flags. **Flags** can be assigned to a gesture, and allow control related to execution and gesture regions of a valid gesture input. specified in [@gisplweb], there are four flag types, three of which were implemented in GISpL.js:

>When a gesture has the "oneshot" flag, then it can only be triggered once by a given set of input IDs. Repeated triggering is only possible when the set of IDs captured by the containing region changes.

>When a gesture has the "sticky" flag, then once this gesture has been triggered for the first time, all input events with participating IDs will continue to be sent to the original region, even if they subsequently leave the original boundaries.

>When a gesture has the "bubble" flag set, then the result gesture will be sent to all regions that have been crossed by participating input events, even if the gesture itself has also been flagged as "sticky".

Another option is the duration parameter, that can be set to a gesture and individual features. **Duration** is specified [@gisplweb] as:

>...how far back the history of input events for the containing region should be considered for this gesture. The first value determines the starting point in the history, counting backwards from the present.

## TUIO

There was already mention of TUIO in the previous part of the chapter. As specified in [@tuio1spec], TUIO
 
>...is an attempt to provide a general and versatile communication interface between tangible tabletop controller interfaces and underlying application layers. It was designed to meet the needs of tabletop interactive multi-touch surfaces, where the user is able to manipulate a set of objects and draw gestures onto the table surface with the finger tips.

TUIO as a protocol was built on top of the Open Sound Control protocol, which means that [@tuio1spec]

>...TUIO messages can be basically transmitted through any channel that is supported by an actual OSC implementation. The default transport method for the TUIO protocol is the encapsulation of the binary OSC bundle data within UDP packets sent to the default TUIO port number 3333.

GISpL shares some parts of its specification with TUIO. This is related to the input type and component type definition of TUIO, which GISpL adopts in two ways: for some features, and filters. TUIO in versions 1.1 and 2.0 defines the following types

* TUIO 1.1
    * Cursor, e.g. finger
    * Object, e.g. tangible object with a specific pattern
    * Blob, an untagged generic object [@tuio1spec]
* TUIO 2.0
    * Pointer
    * Token
    * Bound
    
Other than the protocols not being backwards compatible [@tuio2spec], and the types containing additional information in the second protocol version, e.g. cursors and pointers on the one hand, and objects and tokens on the other represent identical input.

The feature ID allows a gesture to be constrained by a specific component type of a TUIO defined tangible object [@tuio1spec]. This corresponds with the various identifiers of TUIO Objects, and Tokens. The feature ParentID corresponds with the TUIO defined user identifier, for various users, if supported by the TUIO device that recognizes user input.

Another way GISpL adopts parts of the TUIO specification is the input type and their use within **filters**. With them, the whole gesture or individual features can be filtered to accept only certain input types, as specified by TUIO. The whole list is available below [@gisplweb].

-------------------------------------------------------------------------------
ID      Description
------- -----------------------------------------------------------------------
0       undefined or unknown pointer

1       default ID for an unknown finger (= right index finger ID)

1-5     fingers of the right hand starting with the index finger (index, middle
        , ring, little, thumb)
6-10    same sequence for the left hand

11      stylus

12      laser pointer

13      mouse

14      trackball

15      joystick

16      WiiMote or similar device

17      generic object

18      tagged object (uniquely identifiable)

21      right hand pointing

22      right hand open

23      right hand closed

24      left hand pointing

25      left hand open

26      left hand closed

27      right foot

28      left foot

29      head

30      person

## Related work

## Differences to the original specification

Although GISpL.js aims the implement GISpL as specified, there are a number of differences mostly because of the nature of the environment. First, it runs in the browser, which renders HTML documents using the provided styling; second, it uses JavaScript as a programming language that can modify the page, with no support for any other language.

The most important departure from the specification is the part that deals with regions. As a reminder, GISpL allows for gestures to be added to a region. The region can be defined using a series of bounding points. But as already stated, GISpL.js runs in a browser, so this implementation was modified for regions to be interpreted as DOM nodes, i.e. various elements of the page. This allows the regions to be used in a similar way as specified, with locating regions also being easy and fast because the browser is able to locate DOM nodes.

Additional adjustments are mostly related to the fact that browsers can execute JavaScript, and this language and certain parts of the GISpL specification are incompatible. Additionally, the two features -- Dimensions and Position -- were dropped, along with the "default" flag.

For instance, the specification defines the duration parameter as [@gisplweb]:

> When values are not specified as floating point numbers, but as integers, the unit changes from seconds to "ticks", i.e. sensor readings. 

As JavaScript has only one type for numerical values -- the type `Number` -- it is difficult to interpret the duration as either sensor readings or actual time based on the "type" specified. Therefore, GISpL.js implements only the time interpretation, but as milliseconds. Milliseconds are more common, in practice and in the language itself -- for instance the built in `setTimeout` or `setInterval` functions -- and it subjectively easier to specify `150` instead of `0.015`.
