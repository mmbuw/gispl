export default function motion() {
    let motionApi = {},
        type = 'Motion';
    
    motionApi.type = function motionApi() {
        return type;
    };
    
    motionApi.load = function motionLoad(inputState = []) {
        
        if (!inputState.length) {
            return false;
        }
        
        let result = {x: 0, y: 0};
        
        inputState.forEach(input => {
            let path = input.path;
            if (path.length > 1) {
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
        
        // vector length
        let resultLength = Math.sqrt(Math.pow(result.x, 2) +
                                Math.pow(result.y, 2));
        
        return resultLength !== 0;
    };
    
    return motionApi;
}