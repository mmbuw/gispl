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
        
        it('should reconize the rotation of points even if one is static', () => {
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
        
        it('should be able to set its last known value in the feature values object', () => {
            // centroid is 0.5
            let firstPointer = buildInputFromPointer({x: 0.4, y: 0.4}),
                secondPointer = buildInputFromPointer({x: 0.6, y: 0.6}),
                firstStaticPointer = buildInputFromPointer({x: 0.6, y: 0.4}),
                secondStaticPointer = buildInputFromPointer({x: 0.4, y: 0.6});
            
            //rotate +90 degrees (clockwise) 
            firstPointer.moveTo({x: 0.6, y: 0.4});
            secondPointer.moveTo({x: 0.4, y: 0.6});
            
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
            expect(featureValues.rotation).to.be.above(1.55);
            expect(featureValues.rotation).to.be.below(1.6);
        });
    });
});