export default function screenCalibration(params = {}) {
    
    let calibrationApi = {},
        {mouseEvent} = params;
    
    calibrationApi.mouseEvent = function calibrationMouseEvent(event = {}) {
        if (typeof event.clientX === 'undefined' ||
                typeof event.clientY === 'undefined' ||
                typeof event.screenX === 'undefined' ||
                typeof event.screenY === 'undefined') {
            throw new Error(`Mouse event passed for calibration not
                                a valid event`);
        }
        mouseEvent = event;
    };
    
    calibrationApi.viewportPosition = function calibrationViewportPosition() {
        let top = mouseEvent.screenY - mouseEvent.clientY,
            left = mouseEvent.screenX - mouseEvent.clientX;
        
        return {top, left};
    };
    
    return calibrationApi;
}