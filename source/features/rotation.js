import {vector} from '../vector';
import {featureBase,
            lowerUpperLimit,
            extractConstraintsFrom} from '../feature';

export function rotation(params) {
    
    let constraints = extractConstraintsFrom(params),
        baseFeature = featureBase(params),
        touchInput = [],
        objectInput = [],
        rotationDirections = [],
        limit = lowerUpperLimit(constraints);
    
    function directionVector(first, second) {
        let x = second.screenX - first.screenX,
            // tuio has origin top left, convert to bottom left
            y = first.screenY - second.screenY,
            screenRatio = window.screen.width / window.screen.height;
        return vector(x, Math.floor(y * screenRatio));
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
    
    function angleFromMovingAndFixedPoint(movingPoint, fixedPoint) {
        let path = movingPoint.path,
            angle = 0;
        
        if (path.length > 1) {
            let secondToLastPoint = path[path.length-2],
                lastPoint = path[path.length-1];
                
            let fixedToSecondToLast = directionVector(fixedPoint, secondToLastPoint),
                fixedToLast = directionVector(fixedPoint, lastPoint);
                
            angle = directedAngleBetweenVectors(
                        fixedToSecondToLast,
                        fixedToLast
            );
        }
        
        return angle;
    }
    
    function isClockwise(angle) {
        return angle < Math.PI;
    }
    
    function allValuesIdentical(array) {
        let first = array[0];
        for (let i = 1; i < array.length; i += 1) {
            if (first !== array[i]) {
                return false;
            }
        }
        return true;
    }
    
    function calculateTouchAngle() {
        let centroid = baseFeature.calculateCentroid(touchInput, true),
            inputCount = 0,
            totalAngle = 0,
            averageAngle = 0;
        rotationDirections.length = 0;
        
        if (centroid) {
            for (let i = 0; i < touchInput.length; i += 1) {
                let currentAngle = angleFromMovingAndFixedPoint(touchInput[i], centroid);
                if (currentAngle !== 0) {
                    totalAngle += currentAngle;
                    inputCount += 1;
                    rotationDirections[rotationDirections.length] = isClockwise(currentAngle);
                }
            }
                    
            if (inputCount !== 0 &&
                    allValuesIdentical(rotationDirections)) {
                averageAngle = totalAngle / inputCount;
            }
        }
        return averageAngle; 
    }
    
    let objectRotations = new Map();
    function initRotationValues() {
        objectRotations.clear();
        return {
            touches: undefined,
            objects: objectRotations
        };
    }
    
    function sortTouchObjectInput(inputObjects) {
        touchInput.length = 0;
        objectInput.length = 0;
        for (let i = 0; i < inputObjects.length; i += 1) {
            let inputObject = inputObjects[i];
            if (baseFeature.checkAgainstDefinition(inputObject)) {
                if (typeof inputObject.angle === 'undefined') {
                    touchInput[touchInput.length] = inputObject;
                }
                else {
                    objectInput[objectInput.length] = inputObject;
                }
            }
        }
    }
    
    function calculateObjectAngles(rotationValues) {
        var atLeastOneMatch = false;
        for (let i = 0; i < objectInput.length; i += 1) {
            let path = objectInput[i].path;
            if (path.length > 1) {
                let firstAngle = path[path.length-2].angle,
                    lastAngle = path[path.length-1].angle;
                
                let angle = normalizeAngle(lastAngle - firstAngle);
                if (matchWithValue(angle)) {
                    atLeastOneMatch = true;
                    rotationValues.objects[objectInput[i].componentId] = angle;
                }   
            }
        }
        return atLeastOneMatch;
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
            
            sortTouchObjectInput(inputObjects);
                
            if (touchInput.length > 1) {
                let averageAngle = calculateTouchAngle();  
                match = matchWithValue(averageAngle);
                if (match) {
                    rotationValues.touches = averageAngle;
                }
            }
            
            if (objectInput.length !== 0) {
                let objectMatch = calculateObjectAngles(rotationValues);
                match = match || objectMatch;
            }
            
            if (match) {
                baseFeature.setMatchedValue(rotationValues);
            }
            
            return match;
        },
        
        setValueToObject: baseFeature.setValueToObject
    };
}