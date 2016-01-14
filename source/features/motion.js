import {featureBase} from '../feature';
import {vector} from '../vector';

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
        
        let result = vector(),
            inputCount = 0,
            screenWidth = window.screen.width,
            screenHeight = window.screen.height;
        
        inputState.forEach(inputObject => {
            let path = inputObject.path;
            if (path.length > 1
                    && baseFeature.matchFiltersWith(inputObject)) {
                let lastPoint = path[path.length-1],
                    beforeLastPoint = path[path.length-2];
                
                let x = lastPoint.getScreenX(screenWidth) - 
                            beforeLastPoint.getScreenX(screenWidth),
                    // not a bug
                    // tuio coordinates are with top left origin
                    // so last - beforeLast, is actually (1-last) - (1-beforeLast)
                    // if we want a vector with bottom left origin
                    // which equals beforeLast - last
                    y = beforeLastPoint.getScreenY(screenHeight) -
                            lastPoint.getScreenY(screenHeight);
                
                result.add(vector({x, y}));
                
                inputCount += 1;
            }
        });
        
        if (inputCount === 0) {
            return false;
        }
        
        if (typeof constraints !== 'undefined') {
            result.withScalar(1/inputCount);
            
            return result.x > constraints[0][0] &&
                    result.y > constraints[0][1] &&
                    result.x < constraints[1][0] &&
                    result.y < constraints[1][1];
        }
        
        return result.length() !== 0;
    };
    
    return motionApi;
}