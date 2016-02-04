import TuioPointer from 'tuio/src/TuioPointer';
import TuioTime from 'tuio/src/TuioTime';
import {inputObjectFromTuio} from '../../source/tuio/tuioInputObject';

export function buildPointer(params = {}) {
    let {x:xp, y:yp, sessionId:si,
            time,
            typeId} = params,
            ttime;
            
    if (typeof time !== 'undefined') {
        ttime = TuioTime.fromMilliseconds(time);   
    }
    let pointer = new TuioPointer({xp, yp, si, ttime});

    //not very clean
    if (typeof typeId !== 'undefined') {
        pointer.typeId = typeId;
    }

    //even worse
    if (typeof si !== 'undefined') {
        pointer.getSessionId = function() {
            return si;
        }
    }

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
            pointer.update(updateParams);
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

    return {
        moveTo: function(params) {
            pointerBuilder.moveTo(params);
            return this;
        },
        newSessionId: function() {
            pointerBuilder.newSessionId();
            return this;
        },
        finished: function() {
            return inputObjectFromTuio({
                tuioComponent: pointerBuilder.finished()
            });
        }
    }
}
