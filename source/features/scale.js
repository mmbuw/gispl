import {vector} from '../vector';
import {lowerUpperLimit} from '../feature';

export default function scale(params) {
    
    let constraints = extractContraintsFrom(params),
        limit = lowerUpperLimit(constraints);
    
    function pointToPointDistance(first, second) {
        let x = first.screenX - second.screenX,
            y = first.screenY - second.screenY,
            directionVector = vector({x, y});
            
        return directionVector.length();
    }
    
    return {
        type() {
            return 'Scale';
        },
        load(inputState) {
            let {inputObjects} = inputState;
            
            let firstInput = inputObjects[0],
                secondInput = inputObjects[1],
                centroid = {};
            
            centroid.screenX = (firstInput.path[0].screenX +
                            secondInput.path[0].screenX) / 2;
            centroid.screenY = (firstInput.path[0].screenY +
                            secondInput.path[0].screenY) / 2;
            
            return inputObjects.every(inputObject => {
                let path = inputObject.path,
                    firstPoint = path[0],
                    lastPoint = path[path.length - 1];
                    
                let originalDistance = pointToPointDistance(centroid, firstPoint),
                    currentDistance = pointToPointDistance(centroid, lastPoint),
                    scaleFactor = currentDistance / originalDistance;
                                        
                return scaleFactor >= limit.lower &&
                            scaleFactor <= limit.upper;
            });
        }
    };
}

function extractContraintsFrom(params) {
    let {constraints} = params,
        defaultLowerLimit = 0,
        defaultUpperLimit = Number.POSITIVE_INFINITY;
        
    if (!Array.isArray(constraints)) {
        constraints = [defaultLowerLimit, defaultUpperLimit];
    }
    else if (constraints.length === 1) {
        constraints.push(defaultUpperLimit);
    }
    return constraints;
}