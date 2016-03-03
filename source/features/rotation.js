import {vector} from '../vector';
import {featureBase} from '../feature';

export default function rotation(params) {
    
    let baseFeature = featureBase(params); 
    
    function calculateCentroidFrom(inputObjects) {
        let inputCount = inputObjects.length,
            // check above scale comment
            scale = 10000,
            relativeScreenX = 0,
            relativeScreenY = 0;
        
        inputObjects.forEach(inputObject => {
            relativeScreenX += inputObject.path[0].relativeScreenX * scale;
            relativeScreenY += inputObject.path[0].relativeScreenY * scale;
        });
        
        relativeScreenX /= inputCount * scale;
        relativeScreenY /= inputCount * scale;
                                    
        return {relativeScreenX, relativeScreenY};
    }
    
    function directionVector(first, second) {
        return vector({
            x: second.relativeScreenX - first.relativeScreenX,
            // tuio has origin top left, convert to bottom left
            y: first.relativeScreenY - second.relativeScreenY
        });
    }
    
    function directedAngleBetweenVectors(first, second) {
        // first minus second gives positive values moving clockwise
        let angle = Math.atan2(first.y, first.x) -
                    Math.atan2(second.y, second.x);
        // tuio uses values 3.14 - 6.28 for objects/tokens
        // stick to that instead of negative numbers for counter clockwise
        if (angle < 0) {
            angle += Math.PI * 2;
        }
        return angle;
    }
    
    return {
        type() {
            return 'Rotation';
        },
        load(inputState) {
            let inputObjects = baseFeature
                                .inputObjectsFrom(inputState)
                                .filter(baseFeature.checkAgainstDefinition),
                match = false;
            
            if (inputObjects.length > 1) {
                let centroid = calculateCentroidFrom(inputObjects),
                    inputCount = 0;
                
                let totalAngle = inputObjects.reduce((angleSum, inputObject) => {
                    let path = inputObject.path;
                    if (path.length > 1) {
                        let firstPoint = path[0],
                            lastPoint = path[path.length-1];
                    
                        let centroidToFirst = directionVector(centroid, firstPoint),
                            centroidToLast = directionVector(centroid, lastPoint);
                            
                        let angle = directedAngleBetweenVectors(
                                            centroidToFirst,
                                            centroidToLast
                                    );
                                    
                        angleSum += angle;
                        inputCount += 1;
                    }
                    return angleSum;
                }, 0);
                
                if (inputCount !== 0) {
                    let averageAngle = totalAngle / inputCount;
                        
                    match = averageAngle !== 0;
                    if (match) {
                        baseFeature.setCalculatedValue(averageAngle);
                    }
                }
            }
            
            return match;
        },
        
        setValueToObject: baseFeature.setValueToObject
    };
}