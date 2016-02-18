import {createGesture} from '../../source/gesture';
import {buildInputFromPointer} from '../helpers/pointer';

describe('gesture with duration', () => {

    let motionGestureDefinition,
        node = 'test-dom-node-does-not-matter-if-it-is-a-string',
        nodesToEmitOn = [node],
        mockState = {
            node,
            inputObjects: [null] //should contain e.g. tuio pointers but it doesn't matter
        },
        startingTime,
        clock;
    
    function addDurationToGesture(duration, gesture = motionGestureDefinition) {
        return $.extend(
            {}, gesture, {duration}
        );
    }
    
    beforeEach(() => {
        motionGestureDefinition = {
            name: 'motion-gesture',
            features: [
                {type: 'Motion'}
            ]
        };
        startingTime = new Date().getTime()
        clock = sinon.useFakeTimers(startingTime);
    });
    
    afterEach(() => {
        clock.restore();
    });
    
    it('should not recognize gesture if path time less than lower duration bound', () => {
        let oneSecondDuration = [1],
            timeAfter999ms = 999,
            oneSecondDurationMotionDefinition = addDurationToGesture(oneSecondDuration),
            oneSecondDurationMotionGesture = createGesture(oneSecondDurationMotionDefinition);
       
       let pointerMoving = buildInputFromPointer({x: 0, y: 0})
                                        .moveTo({x: 0.1, y: 0.1})
                                        .finished();
       clock.tick(timeAfter999ms);
       
       expect(
           oneSecondDurationMotionGesture.load({
               node,
               inputObjects: [pointerMoving]
           })
       ).to.deep.equal([]);
    });
    
    it(`should recognize gesture if path time more than or equal to lower duration bound,
            and other parameters valid`, () => {
        let minimumOneSecondDuration = [1],
            timeAfter1000ms = 1000,
            oneSecondDurationMotionDefinition = addDurationToGesture(minimumOneSecondDuration),
            oneSecondDurationMotionGesture = createGesture(oneSecondDurationMotionDefinition);
       
       let pointerMoving = buildInputFromPointer({x: 0, y: 0})
                                        .moveTo({x: 0.1, y: 0.1})
                                        .finished();
                            
       clock.tick(timeAfter1000ms);
                 
       expect(
           oneSecondDurationMotionGesture.load({
               node,
               inputObjects: [pointerMoving]
           })
       ).to.deep.equal(nodesToEmitOn);
    });
    
    it('should not recognize gesture if path time more than upper duration bound', () => {
        let maximumOneSecondDuration = [0,1],
            timeAfter1001ms = 1001,
            oneSecondDurationMotionDefinition = addDurationToGesture(maximumOneSecondDuration),
            oneSecondDurationMotionGesture = createGesture(oneSecondDurationMotionDefinition);
       
       let pointerMoving = buildInputFromPointer({x: 0, y: 0})
                                        .moveTo({x: 0.1, y: 0.1})
                                        .finished();                                 
       clock.tick(timeAfter1001ms);
            
       expect(
           oneSecondDurationMotionGesture.load({
               node,
               inputObjects: [pointerMoving]
           })
       ).to.deep.equal([]);
    });
    
    it(`should recognize gesture if path time less than or equal to upper duration bound,
            and other parameters valid`, () => {
        let maximumOneSecondDuration = [0,1],
            timeAfter1000ms = 1000,
            oneSecondDurationMotionDefinition = addDurationToGesture(maximumOneSecondDuration),
            oneSecondDurationMotionGesture = createGesture(oneSecondDurationMotionDefinition);
       
       let pointerMoving = buildInputFromPointer({x: 0, y: 0})
                                        .moveTo({x: 0.1, y: 0.1})
                                        .finished();
       clock.tick(timeAfter1000ms);
       
       expect(
           oneSecondDurationMotionGesture.load({
               node,
               inputObjects: [pointerMoving]
           })
       ).to.deep.equal(nodesToEmitOn);
    });
    
    it('should ignore an empty duration array', () => {
        let emptyDuration = [],
            emptyDurationMotionDefinition = addDurationToGesture(emptyDuration),
            emptyDurationMotionGesture = createGesture(emptyDurationMotionDefinition);
       
       emptyDurationMotionGesture.features().forEach(feature => {
           sinon.stub(feature, 'load').returns(true);
       });
        
        expect(
            emptyDurationMotionGesture.load(mockState)
        ).to.deep.equal(nodesToEmitOn);
    });
    
    it('should not recognize gesture if min duration defined, and just one point in path', () => {
        let minimumOneSecondDuration = [1],
            oneSecondDurationMotionDefinition = addDurationToGesture(minimumOneSecondDuration),
            oneSecondDurationMotionGesture = createGesture(oneSecondDurationMotionDefinition);
       
       let pointerMoving = buildInputFromPointer({x: 0, y: 0}).finished();
                                        
       expect(
           oneSecondDurationMotionGesture.load({
               node,
               inputObjects: [pointerMoving]
           })
       ).to.deep.equal([]);
    });
});