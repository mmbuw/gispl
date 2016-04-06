import TuioPointer from 'tuio/src/TuioPointer';
import TuioTime from 'tuio/src/TuioTime';
import {inputObjectFromTuio,
        tuioObjectUpdate} from '../../source/tuio/tuioInputObject';

export function buildPointer(params = {}) {
    let {x:xp, y:yp, sessionId:si,
            time,
            typeId:ti,
            userId:ui} = params,
            ttime;
            
    if (typeof time !== 'undefined') {
        ttime = TuioTime.fromMilliseconds(time);   
    }
    let pointer = new TuioPointer({xp, yp, si, ti, ui, ttime});

    //not very clean
    if (typeof si !== 'undefined') {
        pointer.getSessionId = function() {
            return si;
        }
    }
    
    let identicalPointsAlreadyInPath = false;

    return {
        moveTo: function(params) {
            let {x:xp, y:yp,time} = params,
                ttime,
                updateParams;
            if (typeof time !== 'undefined') {
                ttime = TuioTime.fromMilliseconds(time);
                updateParams = {xp, yp, ttime};
            }
            else {
                updateParams = {xp, yp};
            }
            // tuio client does not update to the same position more than once
            let lastPoint = pointer.path[pointer.path.length-1],
                previousPointIdentical = (lastPoint.getX() === xp) &&
                                            (lastPoint.getY() === yp);
            if (!(previousPointIdentical &&
                    identicalPointsAlreadyInPath)) {
                pointer.update(updateParams);
            }
            identicalPointsAlreadyInPath = previousPointIdentical ? true : false;
            return this;
        },
        newSessionId: function() {
            si += 1;
            return this;
        },
        finished: function() {
            return pointer;
        }
    };
}

export function buildInputFromPointer(params) {
    let pointerBuilder = buildPointer(params);
    
    function tuioInputObject() {
        return inputObjectFromTuio({
            tuioComponent: pointerBuilder.finished()
        });
    }
    let inputObject = tuioInputObject();

    return {
        moveTo: function(params) {
            pointerBuilder.moveTo(params);
            tuioObjectUpdate(inputObject, pointerBuilder.finished());
            return this;
        },
        newSessionId: function() {
            pointerBuilder.newSessionId();
            inputObject.identifier = pointerBuilder.finished().getSessionId();
            return this;
        },
        finished: function() {
            return inputObject;
        }
    }
}
