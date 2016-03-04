import TuioPointer from 'tuio/src/TuioPointer';
import TuioCursor from 'tuio/src/TuioCursor';
import TuioToken from 'tuio/src/TuioToken';
import TuioObject from 'tuio/src/TuioObject';

export function inputObjectFromTuio(params) {
    let {tuioComponent, calibration} = params;

    let identifier = tuioComponent.getSessionId(),
        point = pointInformation(tuioComponent, calibration, new Date().getTime()),
        path = [point],
        componentType = componentTypeInformation(tuioComponent),
        type;

    if (typeof tuioComponent.getTypeId === 'function') {
        type = tuioComponent.getTypeId();
    }

    return {
        identifier, type,
        path,
        componentType,
        ...point
    };
}

export function inputObjectFromPath(params = {}) {
    let {inputObject,
            path} = params,
        {identifier,
            type} = inputObject;
            
    let firstPointInPath = path[0];
    
    return {
        identifier, path, type,
        ...firstPointInPath
    };
}

export function tuioObjectUpdate(params) {
    let {tuioComponent,
            calibration,
            inputObject} = params;
    // update path
    let lastPoint = pointInformation(tuioComponent, calibration, new Date().getTime());
    inputObject.path.push(lastPoint);
    // update point information (screenX, clientX...)
    // but keep the original starting time
    Object.assign(inputObject, pointInformation(tuioComponent,
                                                    calibration,
                                                    inputObject.startingTime));
}

function pointInformation(point, calibration, startingTime) {

    let relativeScreenX = point.getX(),
        relativeScreenY = point.getY(),
        // this is time in milliseconds
        tuioTime = (point.getTuioTime().seconds * 1e6 +
                    point.getTuioTime().microSeconds) * 1e-3,
        screenX = point.getScreenX(window.screen.width),
        screenY = point.getScreenY(window.screen.height),
        clientX, clientY,
        pageX, pageY,
        angle;

    if (typeof calibration !== 'undefined') {
        ({x:clientX,
         y:clientY} = calibration.screenToViewportCoordinates({screenX,
                                                             screenY}));
        pageX = clientX + window.pageXOffset;
        pageY = clientY + window.pageYOffset;
    }
    
    if (!isNaN(point.getAngle())) {
        angle = point.getAngle();
    }

    return {
        relativeScreenX, relativeScreenY,
        screenX, screenY,
        clientX, clientY,
        pageX, pageY,
        startingTime,
        tuioTime,
        angle
    };
}

export const inputType = {
    POINTER: 'pointer',
    CURSOR: 'cursor',
    OBJECT: 'object',
    TOKEN: 'token'
};

function componentTypeInformation(tuioComponent) {
    if (tuioComponent instanceof TuioPointer)
        return inputType.POINTER;
    if (tuioComponent instanceof TuioCursor)
        return inputType.CURSOR;
    if (tuioComponent instanceof TuioObject)
        return inputType.OBJECT;
    if (tuioComponent instanceof TuioToken)
        return inputType.TOKEN;
}