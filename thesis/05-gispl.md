# GISpL

This chapter gives a brief overview of GISpL, the ideas and specification behind it. At its core, the Gestural Interface Specification Language allows a user to define a gesture by merely specifying of what kind of features it should consist of, and then relying on the underneath GISpL implementation to validate future user input. This is decribed in [@gispl]:

>GISpL is a formal language which allows both researchers and developers to unambiguously describe the behavior of a wide range of gestural interfaces using a simple JSON-based syntax. GISpL supports a multitude of input modalities, including multi-touch, digital pens, multiple regular
mice, tangible interfaces or mid-air gestures. GISpL introduces a novel view on gestural interfaces from a software-engineering perspective. By using GISpL, developers can avoid tedious tasks such as reimplementing the same gesture recognition algorithms over and over again. Researchers benefit from the ability to quickly reconfigur prototypes of gestural UIs on-the-fly, possibly even in the middle of an expert review

Instead of implementing a gesture for a specific technology, e.g. smartphone device, one can define a gesture using GISpL and this gesture will then be recognized on any device that supports the language. GISpL.js, a JavaScript library and the topic of this work, is an attempt to allow this language to be used inside of a browser. Although a browser is not a device, JavaScript based applications for the browser are increasingly being written, and there is therefore interest for an easier way to bring gestures to the browser.

## Defining a gesgture

The opening paragraph already used the word features. Features are the most important building block of a GISpL defined gesture. Once the implementer breaks down a gesture into possible features, user input can be validated as a defined gesture. As an example, how could one select festures for a motion based gesture in GISpL:

```
"features": [
    {
        "type": "Motion"
    }
]
```

What if the gesture needs then to be modified for it to work only if there is motion, but with two input points, e.g. fingers?

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

Simply adding a second feature was enough to modify the gesture. This examples also shows how GISpL in essence works: a gesture is valid, if user input satisfies all the features specified in the gesture. In total, GISpL in its current form specifies 11 features, two of which we already saw. The features allow for futher configuration by specifying

**Count** is probably the simplest feature, as it only checks the number of input points. In contrast to some other features, the usage of constraints is mandatory, as it defines the lower and upper bound of input points.

**Motion** checks if user input is in fact moving. The constraints can further allow for this motion to be directed; the two points in the constrain form a box. The average motion vector of all input points [@gispl] then needs to be constrained within this box.

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
-------------------------------------------------------------------------------------------------------------

There are several other options other than features that allow more control over a GISpL defined gesture.

## TUIO
## Related work
## Differences to the original proposal
