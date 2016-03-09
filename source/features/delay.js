export default function delay(params) {
    
    isValidDelayFeature(params);
    
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

export const delayException = {
    NO_CONSTRAINTS: `Attempting to add a delay feature with no constraints;
                        i.e. lower and upper limit`,
    INVALID_CONSTRAINTS: `Attempting to add a delay feature with invalid constraints;
                            expecting array of lower, upper`
};

function isValidDelayFeature(params) {
    let {constraints} = params;
    
    if (typeof constraints === 'undefined') {
        throw new Error(delayException.NO_CONSTRAINTS);
    }
    if (!Array.isArray(constraints)) {
        throw new Error(`${delayException.INVALID_CONSTRAINTS}; received ${constraints}`);
    }
    if (constraints.length === 0) {
        throw new Error(`${delayException.NO_CONSTRAINTS}; received empty array.`);
    }
    if (constraints.length > 2) {
        throw new Error(`${delayException.INVALID_CONSTRAINTS};
                            received more than 2 constraints.`);
    }
    constraints.forEach(value => {
        if (!Number.isFinite(value)) {
            throw new Error(`${delayException.INVALID_CONSTRAINTS};
                received: ${typeof constraints[0]}, ${typeof constraints[1]}`);
        } 
    });
}