import {vector} from '../vector';
import {featureBase,
            lowerUpperLimit,
            calculateCentroidFrom,
            extractConstraintsFrom} from '../feature';

export function rotation(params) {
    
    let constraints = extractConstraintsFrom(params),
        baseFeature = featureBase(params),
        touchInput = [],
        objectInput = [],
        limit = lowerUpperLimit(constraints);
    
    function directionVector(first, second) {
        return vector({
            x: second.relativeScreenX - first.relativeScreenX,
            // tuio has origin top left, convert to bottom left
            y: first.relativeScreenY - second.relativeScreenY
        });
    }
    
    function normalizeAngle(value) {
        // tuio uses values PI -> 2PI for rotation
        // stick to that instead of negative numbers for counter clockwise
        if (value < 0) {
            value += Math.PI * 2;
        }
        return value;
    }
    
    function directedAngleBetweenVectors(first, second) {
        // first minus second gives positive values moving clockwise
        let angle = Math.atan2(first.y, first.x) -
                    Math.atan2(second.y, second.x);
                    
        return normalizeAngle(angle);
    }
    
    function matchWithValue(angle) {
        return angle !== 0 &&
                    angle >= limit.lower &&
                    angle <= limit.upper;
    }
    
    function angleFromMovingAndFixedPoint(moving, fixed) {
        let path = moving.path,
            firstPoint = path[0],
            lastPoint = path[path.length-1];
    
        let fixedToFirstPoint = directionVector(fixed, firstPoint),
            fixedToLastPoint = directionVector(fixed, lastPoint);
            
        return directedAngleBetweenVectors(
                    fixedToFirstPoint,
                    fixedToLastPoint
        );
    }
    
    function isClockwise(angle) {
        return angle < Math.PI;
    }
    
    function allValuesIdentical(array) {
        let first = array[0];
        return array.every(current => current === first);
    }
    
    function calculateAverageAngleFrom(inputObjects) {
        let centroid = calculateCentroidFrom(inputObjects),
            inputCount = 0,
            rotationDirections = [],
            averageAngle;
        
        let totalAngle = inputObjects.reduce((angleSum, inputObject) => {
            let currentAngle = angleFromMovingAndFixedPoint(inputObject, centroid);
            
            if (currentAngle !== 0) {
                angleSum += currentAngle;
                inputCount += 1;
                rotationDirections.push(isClockwise(currentAngle));
            }
            return angleSum;
        }, 0);
                
        if (inputCount !== 0 &&
                allValuesIdentical(rotationDirections)) {
            averageAngle = totalAngle / inputCount;
        }
        return averageAngle; 
    }
    
    function initRotationValues() {
        return {
            touches: undefined,
            objects: {}
        };
    }
    
    return {
        type() {
            return 'Rotation';
        },
        load(inputState) {
            let inputObjects = baseFeature
                                .inputObjectsFrom(inputState),
                match = false,
                rotationValues = initRotationValues();
            
            touchInput.length = 0;
            objectInput.length = 0;
            for (let i = 0; i < inputObjects.length; i += 1) {
                let inputObject = inputObjects[i];
                if (baseFeature.checkAgainstDefinition(inputObject)) {
                    if (typeof inputObject.angle === 'undefined') {
                        touchInput.push(inputObject);
                    }
                    else {
                        objectInput.push(inputObject);
                    }
                }
            }
                
            if (touchInput.length > 1) {
                let averageAngle = calculateAverageAngleFrom(touchInput);   
                match = matchWithValue(averageAngle);
                if (match) {
                    rotationValues.touches = averageAngle;
                }
            }
            
            if (objectInput.length !== 0) {
                objectInput.forEach(inputObject => {
                    let path = inputObject.path,
                        firstAngle = path[0].angle,
                        lastAngle = path[path.length-1].angle;
                    
                    let angle = normalizeAngle(lastAngle - firstAngle);
                    if (matchWithValue(angle)) {
                        match = true;
                        rotationValues.objects[inputObject.componentId] = angle;
                    }
                });
            }
            
            if (match) {
                baseFeature.setMatchedValue(rotationValues);
            }
            
            return match;
        },
        
        setValueToObject: baseFeature.setValueToObject
    };
}