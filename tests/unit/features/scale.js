import {featureFactory} from '../../../source/feature';
import {buildInputFromPointer} from '../../helpers/pointer';

describe('feature', () => {
    describe('scale', () => {
        
        let type = 'scale';
        
        it('should construct', () => {
            let scaleFeature = featureFactory({type});
                
            expect(scaleFeature).to.be.an('object');
            expect(scaleFeature.type()).to.equal('Scale');
            expect(scaleFeature.load).to.be.a('function');
        });
        
        it(`should recognize the feature if two points satisfy
                the lower limit constraint`, () => {
            let params = {
                    type,
                    constraints: [2]
                },
                scaleFeature = featureFactory(params),
                firstInput = buildInputFromPointer({x: 0.4, y: 0.4}),
                secondInput = buildInputFromPointer({x: 0.6, y: 0.6});
            
            firstInput.moveTo({x: 0.30, y: 0.30});
            secondInput.moveTo({x: 0.7, y: 0.7});
            
            let inputObjects = [
                firstInput.finished(),
                secondInput.finished()
            ];
            
            expect(
                scaleFeature.load({inputObjects})
            ).to.equal(true);
        });
        
        it(`should not recognize the feature if two points do not satisfy
                the lower limit constraint`, () => {
            let params = {
                    type,
                    constraints: [2]
                },
                scaleFeature = featureFactory(params),
                belowMinScaleInput = buildInputFromPointer({x: 0.4, y: 0.4}),
                secondInput = buildInputFromPointer({x: 0.6, y: 0.6});
            
            belowMinScaleInput.moveTo({x: 0.35, y: 0.35});
            secondInput.moveTo({x: 0.7, y: 0.7});
            
            let inputObjects = [
                belowMinScaleInput.finished(),
                secondInput.finished()
            ];
            
            expect(
                scaleFeature.load({inputObjects})
            ).to.equal(false);
        });
        
        it(`should recognize the feature if two points satisfy
                the upper limit constraint`, () => {
            let params = {
                    type,
                    constraints: [0, 2]
                },
                scaleFeature = featureFactory(params),
                firstInput = buildInputFromPointer({x: 0.4, y: 0.4}),
                secondInput = buildInputFromPointer({x: 0.6, y: 0.6});
            
            firstInput.moveTo({x: 0.31, y: 0.31});
            secondInput.moveTo({x: 0.7, y: 0.7});
            
            let inputObjects = [
                firstInput.finished(),
                secondInput.finished()
            ];
            
            expect(
                scaleFeature.load({inputObjects})
            ).to.equal(true);
        });
        
        it(`should not recognize the feature if two points do not satisfy
                the upper limit constraint`, () => {
            let params = {
                    type,
                    constraints: [1, 2]
                },
                scaleFeature = featureFactory(params),
                firstInput = buildInputFromPointer({x: 0.4, y: 0.4}),
                aboveMaxScaleInput = buildInputFromPointer({x: 0.6, y: 0.6});
            
            firstInput.moveTo({x: 0.3, y: 0.3});
            aboveMaxScaleInput.moveTo({x: 0.71, y: 0.71});
            
            let inputObjects = [
                firstInput.finished(),
                aboveMaxScaleInput.finished()
            ];
            
            expect(
                scaleFeature.load({inputObjects})
            ).to.equal(false);
        });
        
        it('should recognize any scale if no constraints specified', () => {
            let params = {type},
                scaleFeature = featureFactory(params),
                firstInput = buildInputFromPointer({x: 0.4, y: 0.4}),
                secondInput = buildInputFromPointer({x: 0.6, y: 0.6}),
                smallValue = 0.001;
            
            firstInput.moveTo({x: 0.4 - smallValue, y: 0.4 - smallValue});
            secondInput.moveTo({x: 0.6 + smallValue, y: 0.6 + smallValue});
            
            let inputObjects = [
                firstInput.finished(),
                secondInput.finished()
            ];
            
            expect(
                scaleFeature.load({inputObjects})
            ).to.equal(true);
        });
        
        it('should not recognize the scale of 1, even when no constraints', () => {
            let params = {type},
                scaleFeature = featureFactory(params),
                staticFirstInput = buildInputFromPointer({x: 0.4, y: 0.4}),
                staticSecondInput = buildInputFromPointer({x: 0.6, y: 0.6});
            
            staticFirstInput.moveTo({x: 0.4, y: 0.4});
            staticSecondInput.moveTo({x: 0.6, y: 0.6});
            
            let inputObjects = [
                staticFirstInput.finished(),
                staticSecondInput.finished()
            ];
            
            expect(
                scaleFeature.load({inputObjects})
            ).to.equal(false);
        });
        
        it('should not recognize the feature when points not moving at all', () => {
            let params = {type},
                scaleFeature = featureFactory(params),
                staticFirstInput = buildInputFromPointer({x: 0.4, y: 0.4}),
                staticSecondInput = buildInputFromPointer({x: 0.6, y: 0.6});
            
            let inputObjects = [
                staticFirstInput.finished(),
                staticSecondInput.finished()
            ];
            
            expect(
                scaleFeature.load({inputObjects})
            ).to.equal(false);
        });
        
        it('should recognize scale even when one input static', () => {
            let params = {type},
                scaleFeature = featureFactory(params),
                staticInput = buildInputFromPointer({x: 0.4, y: 0.4}),
                movingInput = buildInputFromPointer({x: 0.6, y: 0.6});
            
            staticInput.moveTo({x: 0.4, y: 0.4});
            movingInput.moveTo({x: 0.7, y: 0.7});
            
            let inputObjects = [
                staticInput.finished(),
                movingInput.finished()
            ];
            
            expect(
                scaleFeature.load({inputObjects})
            ).to.equal(true);
        });
        
        it(`should recognize the feature when valid while using
                more than two points`, () => {
            let params = {type},
                scaleFeature = featureFactory(params),
                staticFirstInput = buildInputFromPointer({x: 0.4, y: 0.4}),
                staticSecondInput = buildInputFromPointer({x: 0.4, y: 0.4}),
                movingThirdInput = buildInputFromPointer({x: 0.6, y: 0.6});
            
            staticFirstInput.moveTo({x: 0.4, y: 0.4});
            staticSecondInput.moveTo({x: 0.4, y: 0.4});
            movingThirdInput.moveTo({x: 0.8, y: 0.8});
            
            let inputObjects = [
                staticFirstInput.finished(),
                staticSecondInput.finished(),
                movingThirdInput.finished()
            ];
            
            expect(
                scaleFeature.load({inputObjects})
            ).to.equal(true);
        });
        
        it('should not recognize the feature when using just one point', () => {
            let params = {type},
                scaleFeature = featureFactory(params),
                movingInput = buildInputFromPointer({x: 0.6, y: 0.6});
            
            movingInput.moveTo({x: 0.8, y: 0.8});
            
            let inputObjects = [
                movingInput.finished()
            ];
            
            expect(
                scaleFeature.load({inputObjects})
            ).to.equal(false);
        });

        it(`should not recognize the feature if the input does not match
                the defined filter`, () => {
            let tuioRightThumbFinger = 0b10000,
                tuioRightIndexFinger = 1,
                tuioRightMiddleFinger = 2,
                filteredScale = featureFactory({
                    type,
                    filters: tuioRightThumbFinger
                }),
                firstInvalidInput = buildInputFromPointer({
                    x: 0.4, y: 0.4, typeId: tuioRightIndexFinger}),
                secondInvalidInput = buildInputFromPointer({
                    x: 0.6, y: 0.6, typeId: tuioRightMiddleFinger});
            
            firstInvalidInput.moveTo({x: 0.30, y: 0.30});
            secondInvalidInput.moveTo({x: 0.7, y: 0.7});
            
            let inputObjects = [
                firstInvalidInput.finished(),
                secondInvalidInput.finished()
            ];

            expect(
                filteredScale.load({inputObjects})
            ).to.equal(false);
        });

        it(`should recognize the feature even if not all input matches
                the defined filter`, () => {
            let tuioRightThumbAndIndexFinger = 0b10001,
                tuioRightIndexFinger = 1,
                tuioRightMiddleFinger = 2,
                tuioRightThumbFinger = 5,
                filteredScale = featureFactory({
                    type,
                    filters: tuioRightThumbAndIndexFinger
                }),
                firstValidInput = buildInputFromPointer({
                    x: 0.4, y: 0.4, typeId: tuioRightIndexFinger}),
                invalidFilterInput = buildInputFromPointer({
                    x: 0.6, y: 0.6, typeId: tuioRightMiddleFinger}),
                secondValidInput = buildInputFromPointer({
                    x: 0.6, y: 0.4, typeId: tuioRightThumbFinger});
            
            firstValidInput.moveTo({x: 0.30, y: 0.30});
            invalidFilterInput.moveTo({x: 0.7, y: 0.7});
            secondValidInput.moveTo({x: 0.7, y: 0.3});
            
            let inputObjects = [
                firstValidInput.finished(),
                invalidFilterInput.finished(),
                secondValidInput.finished()
            ];

            expect(
                filteredScale.load({inputObjects})
            ).to.equal(true);
        });
        
        it('should be able to set its last known value in the feature values object', () => {
            let params = {
                    type,
                    constraints: []
                },
                scaleFeature = featureFactory(params),
                firstInput = buildInputFromPointer({x: 0.4, y: 0.5}),
                secondInput = buildInputFromPointer({x: 0.6, y: 0.5});
            
            firstInput.moveTo({x: 0.30, y: 0.50});
            secondInput.moveTo({x: 0.7, y: 0.5});
            
            let inputObjects = [
                    firstInput.finished(),
                    secondInput.finished()
                ],
                featureValues = {},
                expectedScaleValue = 2,
                epsilon = .01;
            
            scaleFeature.load({inputObjects}); // valid feature
            scaleFeature.setValueToObject(featureValues);
            expect(featureValues.scale).to.be.above(expectedScaleValue - epsilon);
            expect(featureValues.scale).to.be.below(expectedScaleValue + epsilon);
            
        });
    });
});