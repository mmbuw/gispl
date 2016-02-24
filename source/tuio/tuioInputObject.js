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

export function inputObjectFromPath(params = {}) {
    let {identifier,
            path} = params;
            
    let {screenX, screenY,
            relativeScreenX, relativeScreenY,
            clientX, clientY,
            pageX, pageY,
            tuioTime,
            startingTime} = path[0];
    
    return {
        identifier,
        path,
        screenX, screenY,
        relativeScreenX, relativeScreenY,
        clientX, clientY,
        pageX, pageY,
        tuioTime,
        startingTime
    };
}

export function tuioObjectUpdate(params) {
    let {tuioComponent,
            calibration,
            inputObject} = params;
    // update path
    let startFrom = inputObject.path.length,
        newPointsInPath = tuioObjectPath(params, startFrom);
    inputObject.path.push(...newPointsInPath);
    // update point information (screenX, clientX...)
    Object.assign(inputObject, pointInformation(tuioComponent,
                                                    calibration,
                                                    inputObject.startingTime));
}

function tuioObjectPath({tuioComponent, calibration}, startFrom = 0) {
    // so actually this is always just an array of one point
    // so it could be simplied to just take the last point
    // but pointers are in tests often times built as one input with
    // several points in the path and then converted to tuioInputObject
    return tuioComponent.path.slice(startFrom).map(point => {
        return pointInformation(point, calibration);
    });
}

function pointInformation(point, calibration,
                                startingTime = new Date().getTime()) {

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
