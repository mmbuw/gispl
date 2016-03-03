import {featureFactory} from '../../../source/feature';
import {buildInputFromPointer} from '../../helpers/pointer';

describe('feature', () => {
    describe('rotation', () => {
        
        let type = 'rotation',
            anyRotation = featureFactory({type});
        
        it('should recognize rotation of two pointers', () => {
            // centroid is 0.5
            let firstPointer = buildInputFromPointer({x: 0.4, y: 0.4}),
                secondPointer = buildInputFromPointer({x: 0.6, y: 0.6});
            
            //rotate +90 degrees (clockwise) 
            firstPointer.moveTo({x: 0.6, y: 0.4});
            secondPointer.moveTo({x: 0.4, y: 0.6});
            
            let inputObjects = [
                firstPointer.finished(),
                secondPointer.finished()
            ];
            expect(anyRotation.load({inputObjects})).to.equal(true);
        });
        
        it('should not recognize rotation when using just one pointer', () => {
            let movingPointer = buildInputFromPointer({x: 1, y: 1})
                                                .moveTo({x: 0.5, y: 0.5})
                                                .finished();
            
            let inputObjects = [movingPointer];
            expect(anyRotation.load({inputObjects})).to.equal(false);
        });
        
        it('should not recognize rotation when using a non-moving pointer', () => {
            let staticPointer = buildInputFromPointer({x: 0.5, y: 0.5})
                                        .finished(),
                inputObjects = [staticPointer];
            
            expect(anyRotation.load({inputObjects})).to.equal(false);
        });
        
        it('should recognize the rotation of more than two points', () => {
            // centroid is 0.5
            let firstPointer = buildInputFromPointer({x: 0.4, y: 0.4}),
                secondPointer = buildInputFromPointer({x: 0.6, y: 0.6}),
                thirdPointer = buildInputFromPointer({x: 0.6, y: 0.4});
            
            //rotate +90 degrees (clockwise) 
            firstPointer.moveTo({x: 0.6, y: 0.4});
            secondPointer.moveTo({x: 0.4, y: 0.6});
            thirdPointer.moveTo({x: 0.6, y: 0.6});
            
            let inputObjects = [
                firstPointer.finished(),
                secondPointer.finished(),
                thirdPointer.finished()
            ];
            expect(anyRotation.load({inputObjects})).to.equal(true);
        });
        
        it('should recognize the rotation of points even if one is static', () => {
            // centroid is 0.5
            let staticPointer = buildInputFromPointer({x: 0.4, y: 0.4}),
                movingPointer = buildInputFromPointer({x: 0.6, y: 0.6});
            
            //rotate +90 degrees (clockwise) 
            movingPointer.moveTo({x: 0.4, y: 0.6});
            
            let inputObjects = [
                staticPointer.finished(),
                movingPointer.finished()
            ];
            expect(anyRotation.load({inputObjects})).to.equal(true);
        });

        it(`should not recognize the feature if the input does not match
                the defined filter`, () => {
            let tuioRightThumbFinger = 0b10000,
                tuioRightIndexFinger = 1,
                tuioRightMiddleFinger = 2,
                filteredRotation = featureFactory({
                    type,
                    filters: tuioRightThumbFinger
                }),
                firstInvalidInput = buildInputFromPointer({
                    x: 0.4, y: 0.4, typeId: tuioRightIndexFinger}),
                secondInvalidInput = buildInputFromPointer({
                    x: 0.6, y: 0.6, typeId: tuioRightMiddleFinger});
            
            firstInvalidInput.moveTo({x: 0.6, y: 0.4});
            secondInvalidInput.moveTo({x: 0.4, y: 0.6});
            
            let inputObjects = [
                firstInvalidInput.finished(),
                secondInvalidInput.finished()
            ];

            expect(
                filteredRotation.load({inputObjects})
            ).to.equal(false);
        });

        it(`should recognize the feature even if not all input matches
                the defined filter`, () => {
            let tuioRightThumbAndIndexFinger = 0b10001,
                tuioRightIndexFinger = 1,
                tuioRightMiddleFinger = 2,
                tuioRightThumbFinger = 5,
                filteredRotation = featureFactory({
                    type,
                    filters: tuioRightThumbAndIndexFinger
                }),
                firstValidInput = buildInputFromPointer({
                    x: 0.4, y: 0.4, typeId: tuioRightIndexFinger}),
                invalidFilterInput = buildInputFromPointer({
                    x: 0.6, y: 0.4, typeId: tuioRightMiddleFinger}),
                secondValidInput = buildInputFromPointer({
                    x: 0.6, y: 0.6, typeId: tuioRightThumbFinger});
            
            firstValidInput.moveTo({x: 0.6, y: 0.4});
            invalidFilterInput.moveTo({x: 0.7, y: 0.7});
            secondValidInput.moveTo({x: 0.4, y: 0.6});
            
            let expectedValue = Math.PI / 2;
            
            let inputObjects = [
                firstValidInput.finished(),
                invalidFilterInput.finished(),
                secondValidInput.finished()
            ];

            expect(
                filteredRotation.load({inputObjects})
            ).to.equal(true);
            
            let featureValues = {};
            filteredRotation.setValueToObject(featureValues);
            
            expect(featureValues.rotation).to.be.above(expectedValue - 0.01);
            expect(featureValues.rotation).to.be.below(expectedValue + 0.01);
        });
        
        it('should be able to set its last known value in the feature values object', () => {
            // centroid is 0.5
            let firstPointer = buildInputFromPointer({x: 0.4, y: 0.4}),
                secondPointer = buildInputFromPointer({x: 0.6, y: 0.6}),
                firstStaticPointer = buildInputFromPointer({x: 0.6, y: 0.4}),
                secondStaticPointer = buildInputFromPointer({x: 0.4, y: 0.6});
            
            //rotate +90 degrees (clockwise) 
            firstPointer.moveTo({x: 0.6, y: 0.4});
            secondPointer.moveTo({x: 0.4, y: 0.6});
            
            let expectedValue = Math.PI / 2;
            
            let inputObjects = [
                firstPointer.finished(),
                secondPointer.finished(),
                firstStaticPointer.finished(),
                secondStaticPointer.finished()
            ];
            anyRotation.load({inputObjects});
            
            let featureValues = {};
            anyRotation.setValueToObject(featureValues);
            
            // pi/2 is 1.57
            expect(featureValues.rotation).to.be.above(expectedValue - 0.01);
            expect(featureValues.rotation).to.be.below(expectedValue + 0.01);
        });
        
        it('should calculate a signed angle of rotation', () => {
            // centroid is 0.5
            let firstPointer = buildInputFromPointer({x: 0.4, y: 0.4}),
                secondPointer = buildInputFromPointer({x: 0.6, y: 0.6});
            
            //rotate -90 degrees (counter-clockwise) 
            firstPointer.moveTo({x: 0.4, y: 0.6});
            secondPointer.moveTo({x: 0.6, y: 0.4});
            
            // -90deg = 270deg
            // -1.57rad = 4.71rad
            let expectedValue = Math.PI * 3/2;
            
            let inputObjects = [
                firstPointer.finished(),
                secondPointer.finished()
            ];
            anyRotation.load({inputObjects});
            
            let featureValues = {};
            anyRotation.setValueToObject(featureValues);
            
            expect(featureValues.rotation).to.be.above(expectedValue - 0.01);
            expect(featureValues.rotation).to.be.below(expectedValue + 0.01);
        });
    });
});