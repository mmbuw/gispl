import {featureFactory} from '../../../source/feature';
import TuioPointer from 'tuio/src/TuioPointer';

describe('feature', () => {
    describe('count', () => {
        
        let type = 'count';
        
        beforeEach(() => {
        });
        
        it('should return false when passed no, empty, or invalid object', () => {
            let countFeature = featureFactory({type});
            expect(countFeature.load()).to.equal(false);
            expect(countFeature.load([])).to.equal(false);
            expect(countFeature.load({})).to.equal(false);
        });
        
        it(`should recognize the feature if the number of items in the inputState
                has at least the number of defined constraints`, () => {
            let twoMinInputConstraint = [2],
                tuioPointer = null;
            
            let atLeastTwoInput = featureFactory({type, constraints: twoMinInputConstraint});
            
            expect(atLeastTwoInput.load([tuioPointer])).to.equal(false);
            expect(atLeastTwoInput.load([tuioPointer, tuioPointer])).to.equal(true);
            expect(atLeastTwoInput.load(
                [tuioPointer,
                 tuioPointer,
                 tuioPointer,
                 tuioPointer,
                 tuioPointer,
                 tuioPointer,
                 tuioPointer,
                 tuioPointer]
            )).to.equal(true);
        });
        
        it(`should recognize the feature if the number of items in the inputState
                has at most the number of defined constraints`, () => {
            let twoMaxInputConstraint = [0, 2],
                tuioPointer = null;
            
            let maxTwoInput = featureFactory({type, constraints: twoMaxInputConstraint});
            expect(maxTwoInput.load([tuioPointer])).to.equal(true);
            expect(maxTwoInput.load([tuioPointer, tuioPointer])).to.equal(true);
            expect(maxTwoInput.load([tuioPointer, tuioPointer, tuioPointer])).to.equal(false);
        });
    });
});