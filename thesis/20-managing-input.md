# Managing User Input

All three sides, or parts, of the implementation could be valid starting points, but we start with the user input for two reasons. First, user input is the actual starting point, and the part which will in fact trigger the series of events that might lead to a gesture being recognized. Without user input, all other parts of the system will never be used. Second, and more importantly, the type of the user input mandates additional work that would normally not be required. Thus, this needs to be taken care of first, in order to know what 

As already mentioned, in its current form GISpL.js uses TUIO as its information source, which has advantages that were already discussed, but also one important disadvantage. Typically, the browser is an environment that takes care of many things in the background. In the case of user input, this means that when it receives input, be it a mouse click or using the touchscreen, it will automatically locate the page element that received the input. For example, when :

```
var element = document.getElementById('someElementId');
// attach behavior to run when input received
element.addEventListener('touchstart', userDefinedFunction);
```

This means that the user only needs to define a `function` that will be executed once the user interacts with the specified element, and never deals with actually locating the element based on user input. In the case of TUIO this is however not the case. TUIO works outside of the browser, and supplies to it only the relative screen position, e.g. `(0.5, 0.5)` for the x and y coordinates when the user touches the exact middle of the screen. There are two problems with this:

* we do not know which page elements are receiving user input
* screen coordinates usually do not match the browser coordinates

The first problem is simple to solve because all browsers support retrieving the top most element based on x and y coordinates. This is accomplished by using `document.elementFromPoint(x, y)`, which will return either an `HTMLElement` object or `null` if none found. The x and y coordinates that get passed into this method are however browser viewport coordinates, and not the screen coordinates received from a TUIO source.

This leads us to the second problem. Browsers contain several standard or even non-standard properties that give different types of information related to its position on the screen, usually attached to the global `window` object. For instance, `window.screenY` gives the distance of the browser's top border from the top of the screen. However, as it turns out, there is no specific way of finding out what the screen position of the top left corner of the viewport is.

## Searching for elements