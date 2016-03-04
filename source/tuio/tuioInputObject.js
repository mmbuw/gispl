import TuioPointer from 'tuio/src/TuioPointer';
import TuioCursor from 'tuio/src/TuioCursor';
import TuioToken from 'tuio/src/TuioToken';
import TuioObject from 'tuio/src/TuioObject';

export function inputObjectFromTuio(params) {
    let {tuioComponent, calibration} = params;

    let identifier = tuioComponent.getSessionId(),
        point = pointInformation(tuioComponent, calibration, new Date().getTime(), tuioComponent.getAngle()),
        path = tuioObjectPath(params),
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
    let startFrom = inputObject.path.length,
        newPointsInPath = tuioObjectPath(params, startFrom);
    inputObject.path.push(...newPointsInPath);
    // update point information (screenX, clientX...)
    Object.assign(inputObject, pointInformation(tuioComponent,
                                                    calibration,
                                                    inputObject.startingTime,
                                                    tuioComponent.getAngle()));
}

function tuioObjectPath({tuioComponent, calibration}, startFrom = 0) {
    // so actually this is always just an array of one point
    // so it could be simplied to just take the last point
    // but pointers are in tests often times built as one input with
    // several points in the path and then converted to tuioInputObject
    return tuioComponent.path.slice(startFrom).map(point => {
        return pointInformation(point, calibration, new Date().getTime(), tuioComponent.getAngle());
    });
}

function pointInformation(point, calibration, startingTime, currentAngle) {

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
        pageX, pageY,
        angle;

    if (typeof calibration !== 'undefined') {
        ({x:clientX,
         y:clientY} = calibration.screenToViewportCoordinates({screenX,
                                                             screenY}));
        pageX = clientX + window.pageXOffset;
        pageY = clientY + window.pageYOffset;
    }
    
    if (!isNaN(currentAngle)) {
        angle = currentAngle;
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