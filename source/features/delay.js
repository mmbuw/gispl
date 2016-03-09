export default function delay(params) {
    
    let {constraints} = params;
    
    return {
        type() {
            return 'Delay';
        },
        load(inputState) {
            let {inputObjects} = inputState;
            
            return inputObjects.every(inputObject => {
                let currentTime = Date.now();
                
                let match = (currentTime - inputObject.startingTime) >=
                            (constraints[0] * 1000);
                            
                if (typeof constraints[1] !== 'undefined') {
                    match = match && ((currentTime - inputObject.startingTime) <=
                            (constraints[1] * 1000));
                }
                
                return match;
            });
        }
    };
}