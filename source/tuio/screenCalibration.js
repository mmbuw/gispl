export default function screenCalibration(params = {}) {

    let _calibration = {},
        listenForInputEvent = true,
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

            _calibration.mouseEvent(event);
            listenForInputEvent = false;

            setTimeout(function pauseBeforeAllowingRecalibration() {
                listenForInputEvent = true;
            }, inputEventPause);
        }
    }

    // called before the object is returned
    function objectInit() {
        if (typeof mouseEvent !== 'undefined') {
            _calibration.mouseEvent(mouseEvent);
        }
        document.addEventListener('mouseover', captureEvent);
    }

    _calibration.mouseEvent = function calibrationMouseEvent(event = {}) {
        if (typeof event.clientX === 'undefined' ||
                typeof event.clientY === 'undefined' ||
                typeof event.screenX === 'undefined' ||
                typeof event.screenY === 'undefined') {
            throw new Error(`Mouse event passed for calibration not
                                a valid event`);
        }
        mouseEvent = event;

        return this;
    };

    _calibration.viewportPosition = function calibrationViewportPosition() {
        let top = viewportPositionTop(),
            left = viewportPositionLeft();

        return {top, left};
    };

    _calibration.screenToViewportCoordinates = function (coords = {}) {
        let {screenX, screenY} = coords,
            x = screenX - viewportPositionLeft(),
            y = screenY - viewportPositionTop();

        return {x, y};
    };

    _calibration.isScreenUsable = function calibrationScreenUsable() {
        return typeof mouseEvent !== 'undefined';
    };

    objectInit();

    return _calibration;
}
