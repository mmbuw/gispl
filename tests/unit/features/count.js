import {featureFactory} from '../../../source/feature';
import TuioPointer from 'tuio/src/TuioPointer';

describe('feature', () => {
    describe('count', () => {
        
        it('should construct', () => {
            let count = featureFactory('count');
            expect(count).to.be.an('object');
            expect(count.type()).to.equal('Count');
        });
        
        it('should return false when passed no, empty, or invalid object', () => {
            let count = featureFactory('count');
            expect(count.load()).to.equal(false);
            expect(count.load([])).to.equal(false);
            expect(count.load({})).to.equal(false);
        });
    });
});