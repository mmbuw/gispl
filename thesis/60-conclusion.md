# Conclusion

The primary goal of the work was to allow GISpL defined gestures to be recognized in the browser, and to do it in a way to completely support the specification. One additional goal was to adapt the implementation to fit naturally inside of a browser.

Other than some documented exceptions and issues, the primary goal of the work was fulfilled, but this work was for the most part already covered in the original GISpL implementation. What is by that meant is that the actual algorithms behind individual GISpL features were already implemented, although in a different language. On the other hand, the original implementation itself did not cover all parts of the specification, most notably the duration parameter. Additionally, GISpL.js preserved the usage of TUIO as input source despite the presence of browser limitations described in [Managing User Input](#managing-user-input).

As for the other part, GISpL.js first adapts the specification in such a way to work naturally inside of a web page. Second, the implementation was based on an event-based paradigm which is quite common in the JavaScript world. The main idea was then expanded to include user input over TUIO, and the gesture recognition itself, until the final solution was reached. Viewed from the outside, it works in a familiar way to anybody that has worked with a library such as jQuery, and is therefore a flexible solution that is in itself not difficult to use. This makes real world usage realistic and possible.

Future work...
