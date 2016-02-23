export function inputObjectFromTuio(params) {
    let {tuioComponent, calibration} = params;

    let identifier = tuioComponent.getSessionId(),
        {screenX, screenY,
            relativeScreenX, relativeScreenY,
            clientX, clientY,
            pageX, pageY,
            tuioTime,
            startingTime} = pointInformation(tuioComponent, calibration),
        path = tuioObjectPath(params),
        type;

    if (typeof tuioComponent.getTypeId === 'function') {
        type = tuioComponent.getTypeId();
    }

    return {
        identifier, type, path,
        relativeScreenX, relativeScreenY,
        screenX, screenY,
        clientX, clientY,
        pageX, pageY,
        startingTime,
        tuioTime
    };
}

export function tuioObjectUpdate(params) {
    let {tuioComponent,
            calibration,
            inputObject} = params;
    // update path
    let startFrom = inputObject.path.length,
        newPointsInPath = tuioObjectPath(params, startFrom,
                                inputObject.startingTime,
                                inputObject.tuioTime);
    inputObject.path.push(...newPointsInPath);
    // update point information (screenX, clientX...)
    Object.assign(inputObject, pointInformation(tuioComponent, calibration));
}

function tuioObjectPath({tuioComponent, calibration}, startFrom = 0) {
    return tuioComponent.path.slice(startFrom).map(point => {
        return pointInformation(point, calibration);
    });
}

function pointInformation(point, calibration,
                                startingPointerTime = new Date().getTime(),
                                startingTuioTime) {

    let relativeScreenX = point.getX(),
        relativeScreenY = point.getY(),
        // does tuio not have a normal time converter?
        // I don't know. kill me
        // this is time in milliseconds
        tuioTime = (point.getTuioTime().seconds * 1e6 +
                    point.getTuioTime().microSeconds) * 1e-3,
        screenX = point.getScreenX(window.screen.width),
        screenY = point.getScreenY(window.screen.height),
        clientX, clientY,
        pageX, pageY;
    
    if (typeof startingTuioTime === 'undefined') {
        startingTuioTime = tuioTime;
    }
    let elapsedTime = tuioTime - startingTuioTime,
        startingTime = startingPointerTime + elapsedTime;

    if (typeof calibration !== 'undefined') {
        ({x:clientX,
         y:clientY} = calibration.screenToViewportCoordinates({screenX,
                                                             screenY}));
        pageX = clientX + window.pageXOffset;
        pageY = clientY + window.pageYOffset;
    }

    return {
        relativeScreenX, relativeScreenY,
        screenX, screenY,
        clientX, clientY,
        pageX, pageY,
        startingTime,
        tuioTime
    };
}
