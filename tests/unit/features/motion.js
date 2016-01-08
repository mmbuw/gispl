import {featureFactory} from '../../../source/feature';
import TuioPointer from 'tuio/src/TuioPointer';

describe('feature', () => {
    describe('motion', () => {
        
        let motion;
        
        function buildPointer(params = {}) {
            let {x:xp, y:yp} = params;
            
            let pointer = new TuioPointer({xp, yp});
            
            return {
                moveTo: function(params) {
                    let {x:xp, y:yp} = params;
                    pointer.update({xp, yp});
                    return this;
                },
                finished: function() {
                    return pointer;
                }
            };
        }
        
        beforeEach(() => {
            motion = featureFactory('motion');
        });
        
        it('should return false when passed no, empty, or invalid object', () => {
            expect(motion.load()).to.equal(false);
            expect(motion.load([])).to.equal(false);
            expect(motion.load({})).to.equal(false);
        });
        
        it('should recognize motion of inputs with at least two known points', () => {
            let movingPointer = buildPointer({x: 0.5, y: 0.5})
                                    .moveTo({x: 0.6, y: 0.6})
                                    .finished();
            let inputState = [movingPointer];
            expect(motion.load(inputState)).to.equal(true);
        });
        
        it('should not recognize motion of inputs with only one known point', () => {
            let inputState = [new TuioPointer()];
            expect(motion.load(inputState)).to.equal(false);
        });
        
        it('should not recognize motion of input that moved, but stopped', () => {
            let stoppedPointer = buildPointer({x: 0.1, y: 0.1})
                                    .moveTo({x: 0.5, y: 0.5})
                                    .moveTo({x: 0.1, y: 0.1})
                                    .moveTo({x: 0.1, y: 0.1})
                                    .finished();
            
            let inputState = [stoppedPointer];
            expect(motion.load(stoppedPointer)).to.equal(false);
        });
        
        it(`should recognize motion of several pointers,
                at least one of which is moving`, () => {
            let movingPointer = buildPointer({x: 0.5, y: 0.5})
                                    .moveTo({x: 0.6, y: 0.6})
                                    .finished();
            let staticPointer = buildPointer({x: 0.1, y: 0.2})
                                    .finished();
            
            let inputState = [movingPointer, staticPointer];
            
            expect(motion.load(inputState)).to.equal(true);
        });
        
        it(`should not recognize motion of several pointers,
                    none of which is moving`, () => {
            let staticPointer = buildPointer({x: 0.5, y: 0.6})
                                    .finished();
            let staticPointer2 = buildPointer({x: 0.1, y: 0.2})
                                    .finished();
            let inputState = [staticPointer, staticPointer2];
            
            expect(motion.load(inputState)).to.equal(false);
        });
    });
});