import {createGesture} from '../../source/gesture';
import {tuioObjectUpdate} from '../../source/tuio/tuioInputObject';
import {buildInputFromPointer,
            buildPointer} from '../helpers/pointer';

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
    
    function addDurationToFeature(duration, gesture = motionGestureDefinition) {
        let feature = $.extend(
            {}, gesture.features[0], {duration}
        ),
            newGesture = $.extend({}, gesture);
            
        return $.extend(
            {}, newGesture, {features: [feature]}
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
            elapsedTotal500ms = 500,
            elapsedTotal999ms = 499,
            oneSecondDurationMotionDefinition = addDurationToGesture(oneSecondDuration),
            oneSecondDurationMotionGesture = createGesture(oneSecondDurationMotionDefinition);
       
       let pointerMoving = buildInputFromPointer({x: 0, y: 0});
       clock.tick(elapsedTotal500ms);
       pointerMoving.moveTo({x: 0.1, y: 0.1});
       clock.tick(elapsedTotal999ms);
       
       expect(
           oneSecondDurationMotionGesture.load({
               node,
               inputObjects: [pointerMoving.finished()]
           })
       ).to.deep.equal([]);
    });
    
    it(`should recognize gesture if path time more than or equal to lower duration bound,
            and other parameters valid`, () => {
        let minimumOneSecondDuration = [1],
            elapsedTotal500ms = 500,
            elapsedTotal1000ms = 500,
            oneSecondDurationMotionDefinition = addDurationToGesture(minimumOneSecondDuration),
            oneSecondDurationMotionGesture = createGesture(oneSecondDurationMotionDefinition);
       
       let pointerMoving = buildInputFromPointer({x: 0, y: 0});
       clock.tick(elapsedTotal500ms);
       pointerMoving.moveTo({x: 0.1, y: 0.1})                            
       clock.tick(elapsedTotal1000ms);
                 
       expect(
           oneSecondDurationMotionGesture.load({
               node,
               inputObjects: [pointerMoving.finished()]
           })
       ).to.deep.equal(nodesToEmitOn);
    });
    
    it('should not recognize gesture if path time more than upper duration bound', () => {
        let maximumOneSecondDuration = [0,1],
            elaspedTotal500ms = 500,
            elapsedTotal1001ms = 501,
            oneSecondDurationMotionDefinition = addDurationToGesture(maximumOneSecondDuration),
            oneSecondDurationMotionGesture = createGesture(oneSecondDurationMotionDefinition);
       
       let pointerMoving = buildInputFromPointer({x: 0, y: 0});
       clock.tick(elaspedTotal500ms);
       pointerMoving.moveTo({x: 0.1, y: 0.1});                                 
       clock.tick(elapsedTotal1001ms);
            
       expect(
           oneSecondDurationMotionGesture.load({
               node,
               inputObjects: [pointerMoving.finished()]
           })
       ).to.deep.equal([]);
    });
    
    it(`should recognize gesture if path time less than or equal to upper duration bound,
            and other parameters valid`, () => {
        let maximumOneSecondDuration = [0,1],
            elapsedTotal500ms = 500,
            elapsedTotal1000ms = 500,
            oneSecondDurationMotionDefinition = addDurationToGesture(maximumOneSecondDuration),
            oneSecondDurationMotionGesture = createGesture(oneSecondDurationMotionDefinition);
       
       let pointerMoving = buildInputFromPointer({x: 0, y: 0});
       clock.tick(elapsedTotal500ms);
       pointerMoving.moveTo({x: 0.1, y: 0.1});
       clock.tick(elapsedTotal1000ms);
       
       expect(
           oneSecondDurationMotionGesture.load({
               node,
               inputObjects: [pointerMoving.finished()]
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
    
    // some base checks for the feature duration
    // the function that checks is the same 
    it('should not recognize gesture if path time less than lower duration bound of a feature', () => {
        let oneSecondDuration = [1],
            elapsedTotal500ms = 500,
            elapsedTotal999ms = 9999,
            oneSecondDurationMotionDefinition = addDurationToFeature(oneSecondDuration),
            oneSecondDurationMotionGesture = createGesture(oneSecondDurationMotionDefinition);
       
       let pointerMoving = buildInputFromPointer({x: 0, y: 0});
       clock.tick(elapsedTotal500ms);
       pointerMoving.moveTo({x: 0.1, y: 0.1})
       clock.tick(elapsedTotal999ms);
       
       expect(
           oneSecondDurationMotionGesture.load({
               node,
               inputObjects: [pointerMoving.finished()]
           })
       ).to.deep.equal([]);
    });
    
    it(`should recognize gesture if path time more than or equal to lower duration bound
            of feature and other parameters valid`, () => {
        let minimumOneSecondDuration = [1],
            elapsedTotal500ms = 500,
            elapsedTotal1000ms = 500,
            elapsedTotal1500ms = 500,
            oneSecondDurationMotionDefinition = addDurationToFeature(minimumOneSecondDuration),
            oneSecondDurationMotionGesture = createGesture(oneSecondDurationMotionDefinition);

        let pointerMoving = buildInputFromPointer({x: 0, y: 0});
        clock.tick(elapsedTotal500ms);
        pointerMoving.moveTo({x: 0.5, y: 0.5});
        clock.tick(elapsedTotal1000ms);            
        expect(
            oneSecondDurationMotionGesture.load({
                node,
                inputObjects: [pointerMoving.finished()],
                inputHistory: [pointerMoving.finished()]
            })
        ).to.deep.equal([]); // second point is not at least 1s old
        
        clock.tick(elapsedTotal1500ms);            
        expect(
            oneSecondDurationMotionGesture.load({
                node,
                inputObjects: [pointerMoving.finished()],
                inputHistory: [pointerMoving.finished()]
            })
        ).to.deep.equal(nodesToEmitOn);
    });
        
    it('should check input history when feature duration set', () => {
        
        let doubleTapDefinition = {
            name: 'doubletap',
            features:[
                {type: 'Count', constraints:[0,0], duration: [0.2, 0.3]},
                {type: 'Count', constraints:[1,1], duration: [0.1, 0.2]},
                {type: 'Count', constraints:[0,0], duration: [0.01, 0.1]},
                {type: 'Count', constraints:[1,1], duration: [0, 0.01]}
            ]
        },
        doubleTapGesture = createGesture(doubleTapDefinition);
        
        let firstTap = buildInputFromPointer({x: 0, y: 0}).finished();
        
        clock.tick(150);
        
        let secondTap = buildInputFromPointer({x: 0, y: 0}).finished(),
            inputObjects = [secondTap],
            inputHistory = [firstTap, secondTap],
            node = 'node';
                
        expect(
            doubleTapGesture.load({
                node, inputObjects, inputHistory
            })
        ).to.deep.equal([node]);
    });
        
    it(`should not recognize scale if it is not within the specified
            duration window`, () => {
        let scaleOfAtLeastOneSecondDefinition = {
            name: 'any-scale',
            features: [
                {type: 'Scale', duration: [1]}
            ] 
        },
        oneSecondScaleGesture = createGesture(scaleOfAtLeastOneSecondDefinition);
        
        let firstInput = buildInputFromPointer({x: 0.4, y: 0.4}),
            secondInput = buildInputFromPointer({x: 0.6, y: 0.6});
        
        clock.tick(500);
        
        firstInput.moveTo({x: 0.3, y: 0.3});
        secondInput.moveTo({x: 0.7, y: 0.7});
        
        clock.tick(999);
        
        let inputObjects = [
            firstInput.finished(),
            secondInput.finished()
        ],
            inputHistory = inputObjects,
            node = 'current-node';
            
        expect(
            oneSecondScaleGesture.load({
                node, inputObjects, inputHistory
            })
        ).to.deep.equal([]);
    });
        
    it(`should recognize scale if it is within the specified duration window`, () => {
        let scaleOfAtLeastOneSecondDefinition = {
            name: 'any-scale',
            features: [
                {type: 'Scale', duration: [1]}
            ] 
        },
        oneSecondScaleGesture = createGesture(scaleOfAtLeastOneSecondDefinition);
        
        let firstInput = buildInputFromPointer({x: 0.4, y: 0.4}),
            secondInput = buildInputFromPointer({x: 0.6, y: 0.6});
        
        clock.tick(500);
        
        firstInput.moveTo({x: 0.3, y: 0.3});
        secondInput.moveTo({x: 0.7, y: 0.7});
        
        clock.tick(1000);
        
        let inputObjects = [
            firstInput.finished(),
            secondInput.finished()
        ],
            inputHistory = inputObjects,
            node = 'current-node';
            
        expect(
            oneSecondScaleGesture.load({
                node, inputObjects, inputHistory
            })
        ).to.deep.equal([node]);
    });
});