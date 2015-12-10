export default function screenCalibration(params = {}) {
    
    let calibrationApi = {},
        {mouseEvent} = params;
    
    function viewportPositionTop() {
        return mouseEvent.screenY - mouseEvent.clientY;
    }
    
    function viewportPositionLeft() {
        return mouseEvent.screenX - mouseEvent.clientX;
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
    
    return calibrationApi;
}