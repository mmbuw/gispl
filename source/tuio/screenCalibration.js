let instance;

export default function screenCalibration(params = {}) {

    let listenForInputEvent = true,
        {mouseEvent,
         pause: inputEventPause = 2000} = params,
        browserCoordinates = {
            screenX: undefined,
            screenY: undefined,
            clientX: undefined,
            clientY: undefined,
            pageX: undefined,
            pageY: undefined
        };

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

    instance = {
        mouseEvent: calibrationMouseEvent,

        viewportPosition() {
            let top = viewportPositionTop(),
                left = viewportPositionLeft();

            return {top, left};
        },

        screenToBrowserCoordinates(screenX, screenY) {
            let clientX = screenX - viewportPositionLeft(),
                clientY = screenY - viewportPositionTop();
                
            browserCoordinates.clientX = clientX;
            browserCoordinates.clientY = clientY;
            browserCoordinates.screenX = screenX;
            browserCoordinates.screenY = screenY;
            browserCoordinates.pageX = clientX + window.pageXOffset,
            browserCoordinates.pageY = clientY + window.pageYOffset;

            return browserCoordinates;
        },

        isScreenUsable() {
            return typeof mouseEvent !== 'undefined';
        }
    };
    
    return instance;
}

screenCalibration.instance = function calibrationInstance() {
    if (typeof instance === 'undefined') {
        instance = screenCalibration();
    }
    return instance;  
};