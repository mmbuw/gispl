//let inputInterface = {
//    identifier: undefined,
//    type: undefined,
//    screenX: undefined,
//    screenY: undefined,
//    path: undefined
//};

export function inputObjectFromTuio(object) {
    let params = {
        identifier: object.getSessionId()
    };

    if (typeof object.getTypeId === 'function') {
        params.type = object.getTypeId();
    }

    Object.assign(params, pointParams(object));

    params.path = object.path.map(point => {
        let params = pointParams(point);
        return tuioInputObject(params);
    });

    return tuioInputObject(params);
}

function tuioInputObject(params = {}) {
    let _inputObject = {},
        propertiesToSet = {};

    Object.keys(params).forEach(property => {
        let value = params[property];
        propertiesToSet[property] = immutableEnumberableProperty(value);
    });

    return Object.defineProperties(_inputObject, propertiesToSet);
}

function immutableEnumberableProperty(value) {
    let writable = false,
        configurable = false,
        enumerable = true;

    return Object.assign({},
                         {writable, configurable, enumerable},
                         {value});
}

function pointParams(point) {
    return {
        screenX: point.getScreenX(window.screen.width),
        screenY: point.getScreenY(window.screen.height)
    };
}
