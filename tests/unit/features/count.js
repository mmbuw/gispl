import {featureFactory} from '../../../source/feature';
import TuioPointer from 'tuio/src/TuioPointer';

describe('feature', () => {
    describe('count', () => {
        
        let type = 'count';
        
        function inputStateByCount(count) {
            let tuioPointer = null,
                inputState = [];
            for (let i = 0; i < count; i += 1) {
                inputState.push(tuioPointer);
            }
            
            return inputState;
        }
        
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
            let twoMinInputConstraint = [2];
            
            let atLeastTwoInput = featureFactory({type, constraints: twoMinInputConstraint});
            
            expect(atLeastTwoInput.load(inputStateByCount(1))).to.equal(false);
            expect(atLeastTwoInput.load(inputStateByCount(2))).to.equal(true);
            expect(atLeastTwoInput.load(inputStateByCount(3))).to.equal(true);
            expect(atLeastTwoInput.load(inputStateByCount(30))).to.equal(true);
        });
        
        it(`should recognize the feature if the number of items in the inputState
                has at most the number of defined constraints`, () => {
            let twoMaxInputConstraint = [0, 2];
            
            let maxTwoInput = featureFactory({type, constraints: twoMaxInputConstraint});
            
            expect(maxTwoInput.load(inputStateByCount(1))).to.equal(true);
            expect(maxTwoInput.load(inputStateByCount(2))).to.equal(true);
            expect(maxTwoInput.load(inputStateByCount(3))).to.equal(false);
            expect(maxTwoInput.load(inputStateByCount(4))).to.equal(false);
        });
        
        it(`should recognize the feature if the number of items in the inputState
                matches an explicit count in the constraint`, () => {
            let onlyThreeConstraint = [3, 3],
                tuioPointer = null;
            
            let exactlyThreeInput = featureFactory({type, constraints: onlyThreeConstraint});
            expect(exactlyThreeInput.load(inputStateByCount(1))).to.equal(false);
            expect(exactlyThreeInput.load(inputStateByCount(2))).to.equal(false);
            expect(exactlyThreeInput.load(inputStateByCount(3))).to.equal(true);
            expect(exactlyThreeInput.load(inputStateByCount(4))).to.equal(false);
        });
    });
});