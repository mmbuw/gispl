import TuioPointer from 'tuio/src/TuioPointer';
import TuioCursor from 'tuio/src/TuioCursor';
import TuioToken from 'tuio/src/TuioToken';
import TuioObject from 'tuio/src/TuioObject';

export function inputObjectFromTuio(tuioComponent, calibration) {
    let identifier = tuioComponent.getSessionId(),
        point = pointInformation(tuioComponent, calibration, Date.now()),
        path = [point],
        componentType = componentTypeInformation(tuioComponent),
        componentId = componentIdInformation(tuioComponent),
        type,
        user;

    if (typeof tuioComponent.getTypeId === 'function') {
        type = tuioComponent.getTypeId();
    }
    
    if (typeof tuioComponent.getUserId === 'function') {
        user = tuioComponent.getUserId();
    }

    return {
        identifier, type, user,
        path,
        componentType,
        componentId,
        ...point
    };
}

export function inputObjectFromPath(inputObject, path) {
    let {identifier,
            type} = inputObject,
        firstPointInPath = path[0];
    
    return {
        identifier, path, type,
        ...firstPointInPath
    };
}

export function tuioObjectUpdate(inputObject, tuioComponent, calibration) {
    // update path
    let lastPoint = pointInformation(tuioComponent, calibration, Date.now());
    inputObject.path[inputObject.path.length] = lastPoint;
    // update point information (screenX, clientX...)
    // but keep the original starting time
    Object.assign(inputObject, pointInformation(tuioComponent, calibration, inputObject.startingTime));
}

function pointInformation(tuioComponent, calibration, startingTime) {

    let relativeScreenX = tuioComponent.getX(),
        relativeScreenY = tuioComponent.getY(),
        // this is time in milliseconds
        tuioTime = (tuioComponent.getTuioTime().seconds * 1e6 +
                    tuioComponent.getTuioTime().microSeconds) * 1e-3,
        screenX = tuioComponent.getScreenX(window.screen.width),
        screenY = tuioComponent.getScreenY(window.screen.height),
        clientX, clientY,
        pageX, pageY,
        angle;

    if (typeof calibration !== 'undefined' &&
            calibration.isScreenUsable()) {
        ({clientX, clientY,
            pageX, pageY} = calibration.screenToBrowserCoordinates(screenX, screenY));
    }
    
    if (!isNaN(tuioComponent.getAngle())) {
        angle = tuioComponent.getAngle();
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

export const inputType = Object.freeze({
    POINTER: 'pointer',
    CURSOR: 'cursor',
    OBJECT: 'object',
    TOKEN: 'token'
});

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

function componentIdInformation(tuioComponent) {
    if (tuioComponent instanceof TuioObject)
        return tuioComponent.getSymbolId();
}