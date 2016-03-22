import {createGesture} from '../../source/gesture';
import {buildInputFromPointer} from '../helpers/pointer';
import $ from 'jquery';

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
        startingTime = new Date().getTime();
        clock = sinon.useFakeTimers(startingTime);
    });
    
    afterEach(() => {
        clock.restore();
    });
    
    it(`should not recognize motion gesture if partial path within the timeframe 
            specified by the starting-from point invalid`, () => {
        let checkLastSecondOnly = [1000],
            elapsedTotal500ms = 500,
            elapsedTota1001ms = 501,
            oneSecondDurationMotionDefinition = addDurationToGesture(checkLastSecondOnly),
            oneSecondDurationMotionGesture = createGesture(oneSecondDurationMotionDefinition);
        
        // the first point (0, 0) will be ignored
        // it will fall outside of the time frame
        // making the gesture invalid
        let pointerMoving = buildInputFromPointer({x: 0, y: 0});
        clock.tick(elapsedTotal500ms);
        pointerMoving.moveTo({x: 0.1, y: 0.1});
        clock.tick(elapsedTota1001ms);
        
        expect(
            oneSecondDurationMotionGesture.load({
                node,
                inputObjects: [pointerMoving.finished()]
            })
        ).to.deep.equal([]);
    });
    
    it(`should recognize motion gesture if partial path within the timeframe
        specified by the starting-from point valid`, () => {
        let checkLastSecondOnly = [1000],
            elapsedTotal500ms = 500,
            elapsedTotal1000ms = 500,
            oneSecondDurationMotionDefinition = addDurationToGesture(checkLastSecondOnly),
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
    
    it(`should not recognize motion gesture if partial path within the timeframe 
            specified by the start and end points is invalid`, () => {
        let checkBetween2and1SecondsAgo = [2000, 1000],
            elaspedTotal500ms = 500,
            elapsedTotal1499ms = 999,
            oneSecondDurationMotionDefinition = addDurationToGesture(checkBetween2and1SecondsAgo),
            oneSecondDurationMotionGesture = createGesture(oneSecondDurationMotionDefinition);
       
        let pointerMoving = buildInputFromPointer({x: 0, y: 0});
        clock.tick(elaspedTotal500ms);
        // the second point is outside of the timeframe
        // because
        // firstpoint - 500ms pass - second point - 999ms pass
        // the valid interval ends 1ms before the second point
        pointerMoving.moveTo({x: 0.1, y: 0.1});                                 
        clock.tick(elapsedTotal1499ms);
                
        expect(
            oneSecondDurationMotionGesture.load({
                node,
                inputObjects: [pointerMoving.finished()]
            })
        ).to.deep.equal([]);
    });
    
    it(`should recognize motion gesture if partial path within the timeframe 
            specified by the start and end points is valid`, () => {
        let checkBetween2and1SecondsAgo = [2000, 1000],
            elapsedTotal500ms = 500,
            elapsedTotal1500ms = 1000,
            oneSecondDurationMotionDefinition = addDurationToGesture(checkBetween2and1SecondsAgo),
            oneSecondDurationMotionGesture = createGesture(oneSecondDurationMotionDefinition);
       
        let pointerMoving = buildInputFromPointer({x: 0, y: 0});
        clock.tick(elapsedTotal500ms);
        pointerMoving.moveTo({x: 0.1, y: 0.1});
        clock.tick(elapsedTotal1500ms);
        
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
    
    it(`should not recognize motion gesture if partial path within the
            feature timeframe specified by the start point `, () => {
        let checkLastSecondOnly = [1000],
            elapsedTotal500ms = 500,
            elapsedTotal1001ms = 501,
            oneSecondDurationMotionDefinition = addDurationToFeature(checkLastSecondOnly),
            oneSecondDurationMotionGesture = createGesture(oneSecondDurationMotionDefinition);
       
        let pointerMoving = buildInputFromPointer({x: 0, y: 0});
        clock.tick(elapsedTotal500ms);
        pointerMoving.moveTo({x: 0.1, y: 0.1})
        clock.tick(elapsedTotal1001ms);
        
        expect(
            oneSecondDurationMotionGesture.load({
                node,
                inputObjects: [pointerMoving.finished()]
            })
        ).to.deep.equal([]);
    });
    
    it(`should recognize gesture if path time more than or equal to lower duration bound
            of feature and other parameters valid`, () => {
        let checkLastSecondOnly = [1000],
            elapsedTotal500ms = 500,
            elapsedTotal1000ms = 500,
            oneSecondDurationMotionDefinition = addDurationToFeature(checkLastSecondOnly),
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
        ).to.deep.equal([node]);
    });
        
    it('should check input history when feature duration set', () => {
        
        let doubleTapDefinition = {
                name: 'doubletap',
                features:[
                    {type: 'Count', constraints:[1,1], duration: [200, 100]},
                    {type: 'Count', constraints:[0,0], duration: [100, 10]},
                    {type: 'Count', constraints:[1,1], duration: [10]}
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
        let scaleInTheLastSecondOnly = {
                name: 'any-scale',
                features: [
                    {type: 'Scale', duration: [1000]}
                ] 
            },
            oneSecondScaleGesture = createGesture(scaleInTheLastSecondOnly);
            
        let firstInput = buildInputFromPointer({x: 0.4, y: 0.4}),
            secondInput = buildInputFromPointer({x: 0.6, y: 0.6});
        
        clock.tick(500);
        
        firstInput.moveTo({x: 0.3, y: 0.3});
        secondInput.moveTo({x: 0.7, y: 0.7});
        
        clock.tick(501);
        
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
        let scaleInTheLastSecondOnly = {
                name: 'any-scale',
                features: [
                    {type: 'Scale', duration: [1000]}
                ] 
            },
            oneSecondScaleGesture = createGesture(scaleInTheLastSecondOnly);
        
        let firstInput = buildInputFromPointer({x: 0.4, y: 0.4}),
            secondInput = buildInputFromPointer({x: 0.6, y: 0.6});
        
        clock.tick(500);
        
        firstInput.moveTo({x: 0.3, y: 0.3});
        secondInput.moveTo({x: 0.7, y: 0.7});
        
        clock.tick(500);
        
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