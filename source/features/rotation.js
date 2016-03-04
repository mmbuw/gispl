import {vector} from '../vector';
import {featureBase,
            lowerUpperLimit,
            calculateCentroidFrom,
            extractContraintsFrom} from '../feature';

export default function rotation(params) {
    
    let constraints = extractContraintsFrom(params),
        baseFeature = featureBase(params),
        limit = lowerUpperLimit(constraints);
    
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
    
    function matchWithValue(angle) {
        return angle !== 0 &&
                    angle >= limit.lower &&
                    angle <= limit.upper;
    }
    
    return {
        type() {
            return 'Rotation';
        },
        load(inputState) {
            let inputObjects = baseFeature
                                .inputObjectsFrom(inputState)
                                .filter(baseFeature.checkAgainstDefinition),
                touchInput = inputObjects.filter(inputObject => {
                    return typeof inputObject.angle === 'undefined';
                }),
                objectInput = inputObjects.filter(inputObject => {
                    return typeof inputObject.angle !== 'undefined';
                }),
                match = false,
                rotationValues = {
                    touches: undefined,
                    objects: {}
                };
                
            if (touchInput.length > 1) {
                let centroid = calculateCentroidFrom(inputObjects),
                    inputCount = 0;
                
                let totalAngle = touchInput.reduce((angleSum, inputObject) => {
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
                        
                    match = matchWithValue(averageAngle);
                    if (match) {
                        rotationValues.touches = averageAngle;
                    }
                }
            }
            
            if (objectInput.length !== 0) {
                
                objectInput.forEach(inputObject => {
                    let path = inputObject.path,
                        firstAngle = path[0].angle,
                        lastAngle = path[path.length-1].angle;
                    
                    let angle = lastAngle - firstAngle;
                    if (matchWithValue(angle)) {
                        if (!match) {
                            match = true;
                        }
                        rotationValues.objects[inputObject.identifier] = angle;
                    }
                });
            }
            
            if (match) {
                baseFeature.setCalculatedValue(rotationValues);
            }
            
            return match;
        },
        
        setValueToObject: baseFeature.setValueToObject
    };
}