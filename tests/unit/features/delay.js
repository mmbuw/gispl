import {featureFactory} from '../../../source/feature';
import {buildInputFromPointer} from '../../helpers/pointer';

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
        
        it('should construct', () => {
            let delayFeature = featureFactory({type});
            
            expect(delayFeature).to.be.an('object');
            expect(delayFeature.type()).to.equal('Delay');
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
    });
});