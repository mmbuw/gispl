export default function screenCalibration(params = {}) {
    
    let calibrationApi = {},
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
            
            calibrationApi.mouseEvent(event);
            listenForInputEvent = false;
            
            setTimeout(function() {
                listenForInputEvent = true;
            }, inputEventPause);
        }
    }
    
    // called before the object is returned
    function objectInit() {
        if (typeof mouseEvent !== 'undefined') {
            calibrationApi.mouseEvent(mouseEvent);
        }
        document.addEventListener('mouseover', captureEvent);
    }
    
    calibrationApi.mouseEvent = function calibrationMouseEvent(event = {}) {
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
    
    calibrationApi.viewportPosition = function calibrationViewportPosition() {
        let top = viewportPositionTop(),
            left = viewportPositionLeft();
        
        return {top, left};
    };
    
    calibrationApi.screenToViewportCoordinates = function (coords = {}) {
        let {screenX, screenY} = coords,
            x = screenX - viewportPositionLeft(),
            y = screenY - viewportPositionTop();
        
        return {x, y};
    };
    
    calibrationApi.isScreenUsable = function calibrationScreenUsable() {
        return typeof mouseEvent !== 'undefined';
    };
    
    objectInit();
    
    return calibrationApi;
}