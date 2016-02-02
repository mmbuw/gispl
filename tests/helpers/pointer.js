import TuioPointer from 'tuio/src/TuioPointer';
import {inputObjectFromTuio} from '../../source/tuio/tuioInputObject';

export function buildPointer(params = {}) {
    let {x:xp, y:yp, sessionId:si,
            typeId} = params;

    let pointer = new TuioPointer({xp, yp, si});

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
            let {x:xp, y:yp} = params;
            pointer.update({xp, yp});
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
