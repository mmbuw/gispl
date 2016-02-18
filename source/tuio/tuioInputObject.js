export function inputObjectFromTuio(params) {
    let {tuioComponent, calibration} = params;

    let identifier = tuioComponent.getSessionId(),
        {screenX, screenY,
            relativeScreenX, relativeScreenY,
            clientX, clientY,
            pageX, pageY} = pointParams(tuioComponent, calibration),
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
        pageX, pageY
    };
}

export function tuioObjectPath({tuioComponent, calibration}) {
    return tuioComponent.path.map(point => {
        return pointParams(point, calibration);
    });
}

function pointParams(point, calibration) {

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
        tuioTime
    };
}
