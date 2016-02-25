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
    
    function calculateCentroidFrom(inputObjects) {
        let inputCount = inputObjects.length,
            screenX = 0, screenY = 0;
        
        inputObjects.forEach(inputObject => {
            screenX += inputObject.screenX;
            screenY += inputObject.screenY;
        });
        
        screenX /= inputCount;
        screenY /= inputCount;
                                    
        return {screenX, screenY};
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
                            console.log(averageScaleFactor)
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