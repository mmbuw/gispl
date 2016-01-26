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
            clientX, clientY} = pointParams(tuioComponent, calibration),
        path = tuioComponent.path.map(point => {
            return pointParams(point, calibration);
        }),
        type;

    if (typeof tuioComponent.getTypeId === 'function') {
        type = tuioComponent.getTypeId();
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
