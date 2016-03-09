import {featureFactory} from '../../../source/feature';
import {buildInputFromPointer} from '../../helpers/pointer';
import {delayException} from '../../../source/features/delay';

describe('feature', () => {
    
    describe('delay', () => {
        
        let type = 'delay',
            clock;
            
        beforeEach(() => {
            clock = sinon.useFakeTimers(Date.now());
        });
        
        afterEach(() => {
            clock.restore();
        });
        
        it(`should recognize a feature if the lower limit constraint matches`, () => {
            let timeIncrementInMs = 1000,
                minOneSecond = timeIncrementInMs / 1000,
                delayOfMinOneSecond = featureFactory({
                   type, constraints: [minOneSecond]
                });
            
            let inputObject = buildInputFromPointer();
            
            clock.tick(timeIncrementInMs);
            
            let inputObjects = [inputObject.finished()];
            expect(delayOfMinOneSecond.load({inputObjects})).to.equal(true);
        });
        
        it(`should not recognize a feature if the lower limit constraint
                does not match`, () => {
            let timeIncrementInMs = 999,
                minOneSecond = 1,
                delayOfMinOneSecond = featureFactory({
                    type, constraints: [minOneSecond]
                });
            
            let inputObject = buildInputFromPointer();
            
            clock.tick(timeIncrementInMs);
            
            let inputObjects = [inputObject.finished()];
            expect(delayOfMinOneSecond.load({inputObjects})).to.equal(false);
        });
        
        it(`should recognize a feature if the upper limit constraint matches`, () => {
            let timeIncrementInMs = 1000,
                maxOneSecond = timeIncrementInMs / 1000,
                delayOfMaxOneSecond = featureFactory({
                   type, constraints: [0, maxOneSecond]
                });
            
            let inputObject = buildInputFromPointer();
            
            clock.tick(timeIncrementInMs);
            
            let inputObjects = [inputObject.finished()];
            expect(delayOfMaxOneSecond.load({inputObjects})).to.equal(true);
        });
        
        it(`should not recognize a feature if the lower limit constraint
                does not match`, () => {
            let timeIncrementInMs = 1001,
                maxOneSecond = 1,
                delayOfMaxOneSecond = featureFactory({
                    type, constraints: [0, maxOneSecond]
                });
            
            let inputObject = buildInputFromPointer();
            
            clock.tick(timeIncrementInMs);
            
            let inputObjects = [inputObject.finished()];
            expect(delayOfMaxOneSecond.load({inputObjects})).to.equal(false);
        });
        
        it('should throw when defining delay without valid constraints', () => {
            expect(() => {
                featureFactory({type});
            }).to.throw(Error, new RegExp(delayException.NO_CONSTRAINTS));
            
            expect(() => {
                let constraints = {};
                featureFactory({type, constraints});
            }).to.throw(Error, new RegExp(delayException.INVALID_CONSTRAINTS));
            
            expect(() => {
                let constraints = [];
                featureFactory({type, constraints});
            }).to.throw(Error, new RegExp(delayException.NO_CONSTRAINTS));
            
            expect(() => {
                let constraints = ['0'];
                featureFactory({type, constraints});
            }).to.throw(Error, new RegExp(delayException.INVALID_CONSTRAINTS));
            
            expect(() => {
                let constraints = [0, '1'];
                featureFactory({type, constraints});
            }).to.throw(Error, new RegExp(delayException.INVALID_CONSTRAINTS));
            
            expect(() => {
                let constraints = [0, 1, 2];
                featureFactory({type, constraints});
            }).to.throw(Error, new RegExp(delayException.INVALID_CONSTRAINTS));
        });
    });
});