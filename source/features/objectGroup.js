import {calculateCentroidFrom,
        pointToPointDistance,
        lowerUpperLimit} from '../feature';

export function objectgroup(params) {
    
    let {constraints} = params,
        limit = lowerUpperLimit(constraints),
        radius = constraints[2];
    
    return {
        type() {
            return 'ObjectGroup';
        },
        load(inputState) {
            let {inputObjects} = inputState,
                count = inputObjects.length;
            
            let centroid = calculateCentroidFrom(inputObjects),
                distance = pointToPointDistance(centroid, inputObjects[0], true);
                
            let match = Math.floor(distance) <= radius;
            
            return match && count >= limit.lower &&
                        count <= limit.upper;
        }
    };
}