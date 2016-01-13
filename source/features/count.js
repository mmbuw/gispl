import {featureBase,
        lowerUpperLimit} from '../feature';

export default function count(params) {
    
    isValidCountFeature(params);
    
    let countApi = {},
        baseFeature = featureBase(params),
        limit = lowerUpperLimit(params.constraints);
    
    countApi.type = function countType() {
        return 'Count';
    };
    
    countApi.load = function countLoad(inputState) {
        if (!baseFeature.validInput(inputState)) {
            return false;
        }
            
        let count = 0;
        inputState.forEach(inputObject => {
            if (baseFeature.matchFiltersWith(inputObject)) {
                count += 1;   
            }
        });
        let match = count >= limit.lower;
        if (typeof limit.upper !== 'undefined') {
            match = match && (count <= limit.upper);
        }
        
        return match;
    };
    
    return countApi;
}

function isValidCountFeature(countFeature) {
    if (typeof countFeature.constraints === 'undefined'
            || ! countFeature.constraints.length) {
        throw new Error(countFeatureException.NO_CONSTRAINTS);
    }
}
    
export let countFeatureException = {
    NO_CONSTRAINTS: `Attempting to add a count feature with no constraints; i.e. number of contact points`
};