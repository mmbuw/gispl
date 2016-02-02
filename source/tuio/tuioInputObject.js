//let inputInterface = {
//    identifier: undefined,
//    type: undefined,
//    screenX: undefined,
//    screenY: undefined,
//    path: undefined
//};

export function inputObjectFromTuio(params) {
    let {tuioComponent, calibration} = params;

    let identifier = tuioComponent.getSessionId(),
        {screenX, screenY,
            relativeScreenX, relativeScreenY,
            clientX, clientY,
            pageX, pageY} = pointParams(tuioComponent, calibration),
        path = tuioComponent.path.map(point => {
            return pointParams(point, calibration);
        }),
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

function pointParams(point, calibration) {

    let relativeScreenX = point.getX(),
        relativeScreenY = point.getY(),
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
        pageX, pageY
    };
}
