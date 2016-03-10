import TuioObject from 'tuio/src/TuioObject';
import TuioToken from 'tuio/src/TuioToken';
import {inputObjectFromTuio} from '../../../source/tuio/tuioInputObject';
import {featureFactory} from '../../../source/feature';
import {objectIdException} from '../../../source/features/objectId';

describe('feature', () => {
    describe('objectId', () => {
        
        let type = 'objectId';
        
        it('should recognize the feature if object matches the constraints', () => {
            let id = 8,
                constraints = [id, id],
                objectIdFeature = featureFactory({type, constraints});
            
            let object = new TuioObject({sym: id}),
                inputObject = inputObjectFromTuio({
                    tuioComponent: object
                });
            
            let inputObjects = [inputObject];
            expect(objectIdFeature.load({inputObjects})).to.equal(true);
        });
        
        it('should recognize the feature if object within the defined range', () => {
            let id = 8,
                constraints = [id-2, id+3],
                objectIdFeature = featureFactory({type, constraints});
            
            let object = new TuioObject({sym: id}),
                inputObject = inputObjectFromTuio({
                    tuioComponent: object
                });
            
            let inputObjects = [inputObject];
            expect(objectIdFeature.load({inputObjects})).to.equal(true);
        });
        
        // symbol id not yet implemented for tokens
        // it('should recognize the feature if tokens have valid id', () => {
        //     let type = 'objectId',
        //         id = 28,
        //         constraints = [id, id],
        //         objectIdFeature = featureFactory({type, constraints});
            
        //     let token = new TuioToken({sym: id}),
        //         inputObject = inputObjectFromTuio({
        //             tuioComponent: token
        //         });
            
        //     let inputObjects = [inputObject];
        //     expect(objectIdFeature.load({inputObjects})).to.equal(true);
        // });
        
        it(`should not recognize the feature if object id outside of
                defined range`, () => {
            let id = 10,
                constraints = [id+1, id+5],
                objectIdFeature = featureFactory({type, constraints});
            
            let object = new TuioObject({sym: id}),
                inputObject = inputObjectFromTuio({
                    tuioComponent: object
                });
            
            let inputObjects = [inputObject];
            expect(objectIdFeature.load({inputObjects})).to.equal(false);
        });
        
        it('should throw when defining the feature without valid constraints', () => {
            expect(() => {
                featureFactory({type});
            }).to.throw(Error, new RegExp(objectIdException.NO_CONSTRAINTS));
            
            expect(() => {
                let constraints = {};
                featureFactory({type, constraints});
            }).to.throw(Error, new RegExp(objectIdException.INVALID_CONSTRAINTS));
            
            expect(() => {
                let constraints = [];
                featureFactory({type, constraints});
            }).to.throw(Error, new RegExp(objectIdException.INVALID_CONSTRAINTS));
            
            expect(() => {
                let constraints = [0];
                featureFactory({type, constraints});
            }).to.throw(Error, new RegExp(objectIdException.INVALID_CONSTRAINTS));
            
            expect(() => {
                let constraints = [0, 1, 2];
                featureFactory({type, constraints});
            }).to.throw(Error, new RegExp(objectIdException.INVALID_CONSTRAINTS));
            
            expect(() => {
                let constraints = ['0', '1'];
                featureFactory({type, constraints});
            }).to.throw(Error, new RegExp(objectIdException.INVALID_CONSTRAINTS));
        });
    });
});