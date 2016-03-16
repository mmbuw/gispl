export default function screenCalibration(params = {}) {

    let listenForInputEvent = true,
        {mouseEvent,
         pause: inputEventPause = 2000} = params;

    function viewportPositionTop() {
        return mouseEvent.screenY - mouseEvent.clientY;
    }

    function viewportPositionLeft() {
        return mouseEvent.screenX - mouseEvent.clientX;
    }

    function captureEvent(event) {
        if (listenForInputEvent) {

            calibrationMouseEvent(event);
            listenForInputEvent = false;

            setTimeout(function pauseBeforeAllowingRecalibration() {
                listenForInputEvent = true;
            }, inputEventPause);
        }
    }

    function calibrationMouseEvent(event = {}) {
        if (typeof event.clientX === 'undefined' ||
                typeof event.clientY === 'undefined' ||
                typeof event.screenX === 'undefined' ||
                typeof event.screenY === 'undefined') {
            throw new Error(`Mouse event passed for calibration not
                                a valid event`);
        }
        mouseEvent = event;

        return this;
    }

    // called before the object is returned
    if (typeof mouseEvent !== 'undefined') {
        calibrationMouseEvent(mouseEvent);
    }
    document.addEventListener('mouseover', captureEvent);

    return {
        mouseEvent: calibrationMouseEvent,

        viewportPosition() {
            let top = viewportPositionTop(),
                left = viewportPositionLeft();

            return {top, left};
        },

        screenToViewportCoordinates(coords = {}) {
            let {screenX, screenY} = coords,
                clientX = screenX - viewportPositionLeft(),
                clientY = screenY - viewportPositionTop();

            return {clientX, clientY};
        },

        isScreenUsable() {
            return typeof mouseEvent !== 'undefined';
        }
    };
}
