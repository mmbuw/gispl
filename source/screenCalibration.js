export default function screenCalibration(params = {}) {
    
    let calibrationApi = {},
        {mouseEvent} = params;
    
    if (typeof mouseEvent !== 'undefined') {
        mouseEvent - calibrationApi.mouseEvent(mouseEvent);
    }
    
    function viewportPositionTop() {
        return mouseEvent.screenY - mouseEvent.clientY;
    }
    
    function viewportPositionLeft() {
        return mouseEvent.screenX - mouseEvent.clientX;
    }
    
    function captureEvent(event) {
        calibrationApi.mouseEvent(event);
        document.removeEventListener('mouseover', captureEvent);
    }
    
    document.addEventListener('mouseover', captureEvent);
    
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
    
    return calibrationApi;
}