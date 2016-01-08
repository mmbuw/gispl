import motion from './features/motion';

export function featureFactory(type) {
    
    switch (type.toLowerCase()) {
    case 'motion':
        return motion();
    case 'count':
        break;
    default:
        throw new Error(`${featureException.NONEXISTING} ${type}`);
    }
}
    
export let featureException = {
    NONEXISTING: 'Trying to add a gesture with a non-existing feature:'
};