export function getCalibrationMock(params = {}) {
    let {isUsable = true,
            clientX = 0, clientY = 0} = params;
    
    // implementation is the same
    // poor test
    let pageX = clientX + window.pageXOffset,
        pageY = clientY + window.pageYOffset;
            
    return {
        screenToBrowserCoordinates: function() {
            return {clientX, clientY, pageX, pageY};
        },
        isScreenUsable: function() {return isUsable;}
    };
}