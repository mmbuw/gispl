import {featureBase,
        lowerUpperLimit} from '../feature';

export function objectid(params) {
    
    isValidObjectIdFeature(params);
    
    let {constraints} = params,
        baseFeature = featureBase(params),
        limit = lowerUpperLimit(constraints),
        componentIds = [];
        
    function idWithinRange(inputObject) {
        let {componentId} = inputObject,
            match = componentId >= limit.lower &&
                    componentId <= limit.upper;
        return match;
    }
    
    function extractComponentIdsFrom(inputObjects) {
        componentIds.length = 0;
        for (let i = 0; i < inputObjects.length; i += 1) {
            componentIds[i] = inputObjects[i].componentId;
        }
        return componentIds;
    }
    
    return {
        type() {
            return 'ObjectID';
        },
        load(inputState) {
            let inputObjects = baseFeature.inputObjectsFrom(inputState)
                                            .filter(baseFeature.checkAgainstDefinition);
            
            let match = inputObjects.length !== 0 &&
                        inputObjects.every(idWithinRange);
            if (match) {
                let idValues = extractComponentIdsFrom(inputObjects);
                baseFeature.setMatchedValue(idValues);
            } 
            return match;
        },
        setValueToObject: baseFeature.setValueToObject
    };
}

function isValidObjectIdFeature(params) {
    let {constraints} = params;
    
    if (typeof constraints === 'undefined') {
        throw new Error(objectIdException.NO_CONSTRAINTS);
    }
    if (!Array.isArray(constraints) ||
            constraints.length !== 2) {
        throw new Error(`${objectIdException.INVALID_CONSTRAINTS};
                            received ${constraints}`);
    }
    constraints.forEach(value => {
        if (typeof value !== 'number') {
            throw new Error(`${objectIdException.INVALID_CONSTRAINTS};
                received: ${typeof constraints[0]}, ${typeof constraints[1]}`);
        } 
    });
}

export const objectIdException = Object.freeze({
    NO_CONSTRAINTS: `Attempting to add an objectId feature with no constraints;
                        i.e. lower and upper range limit`,
    INVALID_CONSTRAINTS: `Attempting to add an objectId feature with invalid constraints;
                            range has to contain lower and upper limit.`
});