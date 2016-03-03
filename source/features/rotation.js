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
            y: second.relativeScreenY - first.relativeScreenY
        });
    }
    
    return {
        type() {
            return 'Rotation';
        },
        load(inputState) {
            let inputObjects = baseFeature
                                .inputObjectsFrom(inputState)
                                .filter(baseFeature.checkAgainstDefinition),
                centroid = calculateCentroidFrom(inputObjects),
                inputCount = 0,
                match = false;
                
            let totalCosine = inputObjects.reduce((cosineSum, inputObject) => {
                let path = inputObject.path;
                if (path.length > 1) {
                    let firstPoint = path[0],
                        lastPoint = path[path.length-1];
                
                    let centroidToFirst = directionVector(centroid, firstPoint),
                        centroidToLast = directionVector(centroid, lastPoint);
                        
                    let dotProduct = centroidToFirst.dot(centroidToLast),
                        lengths = centroidToFirst.length() * centroidToLast.length(),
                        angleCosine = dotProduct / lengths;
                    
                    if (isFinite(angleCosine)) {
                        cosineSum += angleCosine;
                        inputCount += 1;
                    }
                }
                return cosineSum;
            }, 0);
            
            if (inputCount !== 0) {
                let averageCosine = totalCosine / inputCount,
                    averageAngle = Math.acos(averageCosine);
                    
                match = averageAngle !== 0;
            
                if (match) {
                    baseFeature.setCalculatedValue(averageAngle);
                }
            }
            
            return match;
        },
        
        setValueToObject: baseFeature.setValueToObject
    };
}