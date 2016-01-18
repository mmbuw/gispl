import TuioPointer from 'tuio/src/TuioPointer';

export function buildPointer(params = {}) {
    let {x:xp, y:yp,
            typeId} = params;

    let pointer = new TuioPointer({xp, yp});

    //not very clean
    if (typeof typeId !== 'undefined') {
        pointer.typeId = typeId;
    }

    return {
        moveTo: function(params) {
            let {x:xp, y:yp} = params;
            pointer.update({xp, yp});
            return this;
        },
        finished: function() {
            return pointer;
        }
    };
}
