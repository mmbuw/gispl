import {featureBase} from '../feature';

export default function motion(params = {}) {
    let motionApi = {},
        baseFeature = featureBase(params),
        {constraints} = params;
    
    motionApi.type = function motionApi() {
        return 'Motion';
    };
    
    motionApi.load = function motionLoad(inputState) {
        if (!baseFeature.validInput(inputState)) {
            return false;
        }
        
        let result = {x: 0, y: 0},
            count = 0,
            screenWidth = window.screen.width,
            screenHeight = window.screen.height;
        
        inputState.forEach(inputObject => {
            let path = inputObject.path;
            if (path.length > 1
                    && baseFeature.matchFiltersWith(inputObject)) {
                let lastPoint = path[path.length-1],
                    beforeLastPoint = path[path.length-2];
                
                let tempVector = {
                    x: lastPoint.getScreenX(screenWidth) - 
                            beforeLastPoint.getScreenX(screenWidth),
                    // not a bug
                    // tuio coordinates are with top left origin
                    // so last - beforeLast, is actually (1-last) - (1-beforeLast)
                    // if we want a vector with bottom left origin
                    // which equals beforeLast - last
                    y: beforeLastPoint.getScreenY(screenHeight) -
                            lastPoint.getScreenY(screenHeight)
                };
                
                result.x += tempVector.x;
                result.y += tempVector.y;
                
                count += 1;
            }
        });
        
        if (count === 0) {
            return false;
        }
        
        if (typeof constraints !== 'undefined') {
            let adjustedResult = {x: 0, y: 0};
            adjustedResult.x = result.x / count;
            adjustedResult.y = result.y / count;
            
            return adjustedResult.x > constraints[0][0] &&
                    adjustedResult.y > constraints[0][1] &&
                    adjustedResult.x < constraints[1][0] &&
                    adjustedResult.y < constraints[1][1];
        }
        
        let resultingVectorLength = Math.sqrt(
            Math.pow(result.x, 2) + Math.pow(result.y, 2)
        );
        
        return resultingVectorLength !== 0;
    };
    
    return motionApi;
}