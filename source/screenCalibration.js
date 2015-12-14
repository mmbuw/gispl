export default function screenCalibration(params = {}) {
    
    let calibrationApi = {},
        {mouseEvent,
            _window = window} = params,
        browserX = _window.screenX,
        browserY = _window.screenY;
    
    function browserMovedByX() {
        return _window.screenX - browserX;
    }
    
    function browserMovedByY() {
        return _window.screenY - browserY;
    }
    
    function viewportPositionTop() {
        return mouseEvent.screenY - mouseEvent.clientY + browserMovedByX();
    }
    
    function viewportPositionLeft() {
        return mouseEvent.screenX - mouseEvent.clientX + browserMovedByY();
    }
    
    function captureEvent(event) {
        calibrationApi.mouseEvent(event);
        document.removeEventListener('mouseover', captureEvent);
    }
    
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
    }
    
    objectInit();
    
    return calibrationApi;
}