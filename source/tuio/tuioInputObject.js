//let inputInterface = {
//    identifier: undefined,
//    type: undefined,
//    screenX: undefined,
//    screenY: undefined,
//    path: undefined
//};

export function inputObjectFromTuio(object) {
    let identifier = object.getSessionId(),
        {screenX, screenY} = pointParams(object),
        path = object.path.map(point => pointParams(point)),
        type;

    if (typeof object.getTypeId === 'function') {
        type = object.getTypeId();
    }

    return {
        identifier, type, path, screenX, screenY
    };
}

function pointParams(point) {
    return {
        screenX: point.getScreenX(window.screen.width),
        screenY: point.getScreenY(window.screen.height)
    };
}
