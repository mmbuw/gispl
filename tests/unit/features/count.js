import {featureFactory} from '../../../source/feature';
import TuioPointer from 'tuio/src/TuioPointer';
import {countFeatureException} from '../../../source/features/count';

describe('feature', () => {
    describe('count', () => {

        let type = 'count',
            constraints = [1,1];

        function buildInputState(params = {}) {
            let {count = 1,
                    typeId} = params,
                tuioPointer = new TuioPointer(),
                inputState = [];

            if (typeof typeId !== 'undefined') {
                tuioPointer.typeId = typeId;
            }

            for(let i = 0; i < count; i += 1) {
                inputState.push(tuioPointer);
            }

            return inputState;
        }

        beforeEach(() => {
        });

        it('should return false when passed no, empty, or invalid object', () => {
            let countFeature = featureFactory({type, constraints});
            expect(countFeature.load()).to.equal(false);
            expect(countFeature.load([])).to.equal(false);
            expect(countFeature.load({})).to.equal(false);
        });

        it(`should recognize the feature if the number of items in the inputState
                has at least the number of defined constraints`, () => {
            let twoMinInputConstraint = [2];

            let atLeastTwoInput = featureFactory({type, constraints: twoMinInputConstraint});

            expect(atLeastTwoInput.load(buildInputState({
                count: 1
            }))).to.equal(false);
            expect(atLeastTwoInput.load(buildInputState({
                count: 2
            }))).to.equal(true);
            expect(atLeastTwoInput.load(buildInputState({
                count: 3
            }))).to.equal(true);
            expect(atLeastTwoInput.load(buildInputState({
                count: 30
            }))).to.equal(true);
        });

        it(`should recognize the feature if the number of items in the inputState
                has at most the number of defined constraints`, () => {
            let twoMaxInputConstraint = [0, 2];

            let maxTwoInput = featureFactory({type, constraints: twoMaxInputConstraint});

            expect(maxTwoInput.load(buildInputState({
                count: 1
            }))).to.equal(true);
            expect(maxTwoInput.load(buildInputState({
                count: 2
            }))).to.equal(true);
            expect(maxTwoInput.load(buildInputState({
                count: 3
            }))).to.equal(false);
            expect(maxTwoInput.load(buildInputState({
                count: 4
            }))).to.equal(false);
        });

        it(`should recognize the feature if the number of items in the inputState
                matches an explicit count in the constraint`, () => {
            let onlyThreeConstraint = [3, 3],
                tuioPointer = null;

            let exactlyThreeInput = featureFactory({type, constraints: onlyThreeConstraint});
            expect(exactlyThreeInput.load(buildInputState({
                count: 1
            }))).to.equal(false);
            expect(exactlyThreeInput.load(buildInputState({
                count: 2
            }))).to.equal(false);
            expect(exactlyThreeInput.load(buildInputState({
                count: 3
            }))).to.equal(true);
            expect(exactlyThreeInput.load(buildInputState({
                count: 4
            }))).to.equal(false);
        });

        it('should only accept count features with explicit constraints', () => {

            expect(function() {
                let countFeature = featureFactory({type});
            }).to.throw(Error, new RegExp(countFeatureException.NO_CONSTRAINTS));

            expect(function() {
                let countFeature = featureFactory({type, constraints: []});
            }).to.throw(Error, new RegExp(countFeatureException.NO_CONSTRAINTS));

            expect(function() {
                let countFeature = featureFactory({type, constraints: {}});
            }).to.throw(Error, new RegExp(countFeatureException.NO_CONSTRAINTS));
        });

        it(`should not recognize the feature if the input does not match
                the defined filter`, () => {
            let tuioRightThumbFinger = 0b10000,
                tuioRightIndexFinger = 0b1,
                count: 1,
                filteredCount = featureFactory({
                    type,
                    constraints: [count, count],
                    filters: tuioRightThumbFinger
                });

            expect(filteredCount.load(filteredCount.load(buildInputState({
                count
            })))).to.equal(false);
        });

        it('should allow multiple filters to be set as bitmask', () => {
            let tuioRightIndexFinger = 1,
                filters = 0b10000 | 0b1,
                count = 1,

                filteredCount = featureFactory({
                    type,
                    constraints: [count, count],
                    filters
                }),
                inputState = buildInputState({
                    count,
                    typeId: tuioRightIndexFinger
                });

            expect(filteredCount.load(inputState)).to.equal(true);
        });

        it('should not recognize pointers with unknown typeIds when filters set', () => {
            let tuioUnknownInputType = 0,
                filters = 0b10000 | 0b1,
                count = 1,

                filteredCount = featureFactory({
                    type,
                    constraints: [count, count],
                    filters
                }),
                inputState = buildInputState({
                    count,
                    typeId: tuioUnknownInputType
                });

            expect(filteredCount.load(inputState)).to.equal(false);
        });
    });
});
