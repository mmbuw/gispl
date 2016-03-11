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
            let {inputObjects} = inputState;
            
            let centroid = calculateCentroidFrom(inputObjects);
            
            let inputObjectsWithinRadius = inputObjects.filter(inputObject => {
                let distance = pointToPointDistance(inputObject, centroid, true);
                return Math.floor(distance) <= radius;
            });
            
            let count = inputObjectsWithinRadius.length;
            
            return count >= limit.lower &&
                        count <= limit.upper;
        }
    };
}