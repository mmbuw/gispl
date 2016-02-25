import {vector} from '../vector';
import {lowerUpperLimit} from '../feature';

export default function scale(params) {
    
    let limit = lowerUpperLimit(params.constraints);
    
    function pointToPointDistance(point1, point2) {
        let x = point1.screenX - point2.screenX,
            y = point1.screenY - point2.screenY,
            pointToPointVector = vector({x, y});
            
        return pointToPointVector.length();
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
                    currentDistance = pointToPointDistance(centroid, lastPoint);
                                        
                return (currentDistance / originalDistance) >= limit.lower;
            });
        }
    };
}