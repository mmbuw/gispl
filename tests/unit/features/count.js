import {featureFactory} from '../../../source/feature';
import TuioPointer from 'tuio/src/TuioPointer';

describe('feature', () => {
    describe('count', () => {
        
        let type = 'count',
            countFeature;
        
        beforeEach(() => {
            countFeature = featureFactory({type});
        });
        
        it('should return false when passed no, empty, or invalid object', () => {
            expect(countFeature.load()).to.equal(false);
            expect(countFeature.load([])).to.equal(false);
            expect(countFeature.load({})).to.equal(false);
        });
    });
});