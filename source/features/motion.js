import {featureBase} from '../feature';

export default function motion(params) {
    let motionApi = {},
        baseFeature = featureBase(params);
    
    motionApi.type = function motionApi() {
        return 'Motion';
    };
    
    motionApi.load = function motionLoad(inputState) {
        if (!baseFeature.load(inputState)) {
            return false;
        }
        
        let result = {x: 0, y: 0};
        
        inputState.forEach(input => {
            let path = input.path;
            if (path.length > 1 && baseFeature.matchFiltersWith(input)) {
                let lastPoint = path[path.length-1],
                    beforeLastPoint = path[path.length-2];
                
                let tempVector = {
                    x: lastPoint.getX() - beforeLastPoint.getX(),
                    y: lastPoint.getY() - beforeLastPoint.getY()
                };
                
                result.x += tempVector.x;
                result.y += tempVector.y;
            }
        });
        
        let resultingVectorLength = Math.sqrt(
            Math.pow(result.x, 2) + Math.pow(result.y, 2)
        );
        
        return resultingVectorLength !== 0;
    };
    
    return motionApi;
}