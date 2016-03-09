import {featureBase,
        lowerUpperLimit,
        extractConstraintsFrom} from '../feature';

export default function count(params) {

    isValidCountFeature(params);

    let baseFeature = featureBase(params),
        constraints = extractConstraintsFrom(params),
        limit = lowerUpperLimit(constraints);

    return {
        type() {
            return 'Count';
        },

        load(inputState) {
            let inputObjects = baseFeature.inputObjectsFrom(inputState)
                                            .filter(baseFeature.checkAgainstDefinition);
                                            
            let count = inputObjects.length;
            
            let match = count >= limit.lower &&
                            count <= limit.upper;
            
            if (match) {
                baseFeature.setCalculatedValue(count);
            }

            return match;
        },
        
        setValueToObject: baseFeature.setValueToObject
    };
}

function isValidCountFeature(countFeature) {
    if (typeof countFeature.constraints === 'undefined'
            || ! countFeature.constraints.length) {
        throw new Error(countFeatureException.NO_CONSTRAINTS);
    }
}

export let countFeatureException = {
    NO_CONSTRAINTS: `Attempting to add a count feature with no constraints;
                        i.e. number of contact points`
};
