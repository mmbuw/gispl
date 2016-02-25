import {vector} from '../vector';
import {lowerUpperLimit} from '../feature';

export default function scale(params) {
    
    let constraints = extractContraintsFrom(params),
        limit = lowerUpperLimit(constraints);
    
    function pointToPointDistance(first, second) {
        let scale = 10000,
            x = (first.relativeScreenX * scale - second.relativeScreenX * scale),
            y = (first.relativeScreenY * scale - second.relativeScreenY * scale),
            directionVector = vector({x, y});
            
        return directionVector.length() / scale;
    }
    
    function calculateCentroidFrom(inputObjects) {
        let inputCount = inputObjects.length,
            relativeScreenX = 0,
            relativeScreenY = 0;
        
        inputObjects.forEach(inputObject => {
            relativeScreenX += inputObject.relativeScreenX;
            relativeScreenY += inputObject.relativeScreenY;
        });
        
        relativeScreenX /= inputCount;
        relativeScreenY /= inputCount;
                                    
        return {relativeScreenX, relativeScreenY};
    }
    
    return {
        type() {
            return 'Scale';
        },
        load(inputState) {
            let {inputObjects} = inputState,
                inputCount = inputObjects.length,
                match = false;
                
            if (inputCount > 1) {
                let centroid = calculateCentroidFrom(inputObjects);
                
                let totalScaleFactor = inputObjects.reduce((totalScaleFactor, inputObject) => {
                    let path = inputObject.path,
                        firstPoint = path[0],
                        lastPoint = path[path.length - 1];
                        
                    let originalDistance = pointToPointDistance(centroid, firstPoint),
                        currentDistance = pointToPointDistance(centroid, lastPoint),
                        currentPointScaleFactor = currentDistance / originalDistance;
                        
                    return totalScaleFactor + currentPointScaleFactor;
                }, 0);
                
                let averageScaleFactor = totalScaleFactor / inputObjects.length;
                
                match = averageScaleFactor !== 1 &&
                            averageScaleFactor >= limit.lower &&
                            averageScaleFactor <= limit.upper;
            }
            
            return match;
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
    if (constraints.length === 0) {
        constraints.push(defaultLowerLimit);
    }
    if (constraints.length === 1) {
        constraints.push(defaultUpperLimit);
    }
    return constraints;
}