//let inputInterface = {
//    identifier: undefined,
//    type: undefined,
//    screenX: undefined,
//    screenY: undefined,
//    path: undefined
//};

export function inputObjectFromTuio(object, calibration) {
    let identifier = object.getSessionId(),
        {screenX, screenY,
            clientX, clientY} = pointParams(object, calibration),
        path = object.path.map(point => pointParams(point, calibration)),
        type;

    if (typeof object.getTypeId === 'function') {
        type = object.getTypeId();
    }

    return {
        identifier, type, path,
        screenX, screenY, clientX, clientY
    };
}

function pointParams(point, calibration) {

    let screenX = point.getScreenX(window.screen.width),
        screenY = point.getScreenY(window.screen.height),
        clientX, clientY;

    if (typeof calibration !== 'undefined') {
        ({x:clientX,
         y:clientY} = calibration.screenToViewportCoordinates({screenX,
                                                             screenY}));
    }

    return {
        screenX, screenY,
        clientX, clientY
    };
}
