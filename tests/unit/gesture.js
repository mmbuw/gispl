import {createGesture, gestureException} from '../../source/gesture';
import $ from 'jquery';
import {buildInputFromPointer} from '../helpers/pointer';

describe('gesture', () => {

    let gestureDefinition,
        node = 'test-dom-node-does-not-matter-if-it-is-a-string';

    function addFlagsToGesture(flags) {
        return $.extend(
            {}, gestureDefinition, {flags: flags}
        );
    }

    beforeEach(() => {
        gestureDefinition = {
            name: 'someGestureName',
            features: [
                {type: 'Motion'}
            ]
        };
    });

    it('should save the gesture definition and make it retrievable', () => {
        let gesture = createGesture(gestureDefinition);
        expect(gesture.definition()).to.deep.equal(gestureDefinition);
    });

    it('should instantiate features from gesture definition', () => {
        let gesture = createGesture(gestureDefinition);
        expect(gesture.features().length).to.equal(1);
        expect(gesture.features()[0].type()).to.equal('Motion');

        //add more features
        gestureDefinition.features.push(gestureDefinition.features[0]);

        gesture = createGesture(gestureDefinition);
        expect(gesture.features().length).to.equal(2);
    });

    it('should validate gesture by checking all of its features', () => {
        gestureDefinition.features.push(gestureDefinition.features[0]);
        gestureDefinition.features.push(gestureDefinition.features[0]);

        let gesture = createGesture(gestureDefinition),
            mockedFeatures = gesture.features()
                                        .map(feature => {
                return sinon.mock(feature)
                                .expects('load').once();
            });
        expect(mockedFeatures.length).to.equal(3);

        let mockState = {
            inputObjects: [null]
        };
        gesture.load(mockState);

        mockedFeatures.every(mockedFeature => {
            mockedFeature.verify();
        });
    });

    it('should return false when passed no, empty, or invalid inputState', () => {
        let gesture = createGesture(gestureDefinition);
        expect(gesture.load()).to.equal(false);
        expect(gesture.load([])).to.equal(false);
        expect(gesture.load({})).to.equal(false);
    });

    it('should validate gesture if the features match', () => {
        gestureDefinition.features.push(gestureDefinition.features[0]);

        let gesture = createGesture(gestureDefinition);

        gesture.features().forEach((feature, index) => {
            return sinon.stub(feature, 'load').returns(true);
        });

        let mockState = {
            inputObjects: [null]
        };
        expect(gesture.load(mockState)).to.equal(true);
    });

    it('should not validate gesture if at least one feature does not match', () => {
        gestureDefinition.features.push(gestureDefinition.features[0]);

        let gesture = createGesture(gestureDefinition),
            returnValues = [true, false];

        gesture.features().forEach((feature, index) => {
            return sinon.stub(feature, 'load').returns(returnValues[index]);
        });

        let mockState;
        expect(gesture.load(mockState)).to.equal(false);
    });

    it('should allow a flag on a gesture', () => {
        let flag = 'oneshot',
            flaggedGestureDefinition = addFlagsToGesture(flag);

        let gesture = createGesture(flaggedGestureDefinition);
        expect(gesture.flags().length).to.equal(1);
        expect(gesture.flags()[0]).to.equal(flag);
    });

    it('should allow multiple flags on a gesture', () => {
        let flags = ['oneshot', 'bubble'],
            multipleFlagGestureDefinition = addFlagsToGesture(flags);

        let gesture = createGesture(multipleFlagGestureDefinition);
        expect(gesture.flags().length).to.equal(2);
        expect(gesture.flags()).to.deep.equal(flags);
    });

    it('should throw when using flags other than oneshot, bubble, sticky', () => {
        expect(function() {
            let misspelledOneShot = 'oneshor';
            let invalidFlagsGestureDefinition = addFlagsToGesture(misspelledOneShot);
            createGesture(invalidFlagsGestureDefinition);
        }).to.throw(Error, new RegExp(gestureException.INVALID_FLAGS));

        expect(function() {
            let numericalFlag = 1;
            let invalidFlagsGestureDefinition = addFlagsToGesture(numericalFlag);
            createGesture(invalidFlagsGestureDefinition);
        }).to.throw(Error, new RegExp(gestureException.INVALID_FLAGS));

        expect(function() {
            let misspelledOneShot = 'oneshor',
                flags = ['bubble', misspelledOneShot],
                invalidFlagsGestureDefinition = addFlagsToGesture(flags);
            createGesture(invalidFlagsGestureDefinition);
        }).to.throw(Error, new RegExp(gestureException.INVALID_FLAGS));
    });

    it('should only be triggered once for the same inputObjects with oneshot flag', () => {
        let sessionId = 10,
            movingPointerInput = buildInputFromPointer({x: 0, y: 0, sessionId})
                                        .moveTo({x: 0.5, y: 0.5}),
            oneshotGestureDefinition = addFlagsToGesture('oneshot'),
            oneshotMotionGesture = createGesture(oneshotGestureDefinition);

        let inputObjects = [movingPointerInput.finished()];
        expect(oneshotMotionGesture.load({node, inputObjects})).to.equal(true);
        expect(oneshotMotionGesture.emitOn()).to.deep.equal([node]);

        movingPointerInput.moveTo({x: 0.4, y: 0.4});
        inputObjects = [movingPointerInput.finished()];
        expect(oneshotMotionGesture.load({inputObjects})).to.equal(false);
        expect(oneshotMotionGesture.emitOn()).to.deep.equal([]);
    });

    it('should trigger the gesture again despite oneshot if the inputObjects changes', () => {
        let sessionId = 10,
            movingPointerInput = buildInputFromPointer({x: 0, y: 0, sessionId})
                                        .moveTo({x: 0.5, y: 0.5}),
            oneshotGestureDefinition = addFlagsToGesture('oneshot'),
            oneshotMotionGesture = createGesture(oneshotGestureDefinition);

        let inputObjects = [movingPointerInput.finished()];
        expect(oneshotMotionGesture.load({node, inputObjects})).to.equal(true);
        expect(oneshotMotionGesture.emitOn()).to.deep.equal([node]);

        sessionId += 1;
        let newMovingPointerInput = buildInputFromPointer({x: 0, y: 0, sessionId})
                                        .moveTo({x: 0.5, y: 0.5});

        inputObjects = [newMovingPointerInput.finished()];
        expect(oneshotMotionGesture.load({node, inputObjects})).to.equal(true);
        expect(oneshotMotionGesture.emitOn()).to.deep.equal([node]);

        newMovingPointerInput.moveTo({x: 0.4, y: 0.4});
        inputObjects = [newMovingPointerInput.finished()];
        expect(oneshotMotionGesture.load({inputObjects})).to.equal(false);
        expect(oneshotMotionGesture.emitOn()).to.deep.equal([]);
    });

    it(`should not trigger oneshot gestures if the inputObjects changes, but
        the gesture conditions not satisifed`, () => {
        // more of a check that nothing has gone wrong after oneshot was implemented
        let sessionId = 10,
            movingPointerInput = buildInputFromPointer({x: 0, y: 0, sessionId})
                                        .moveTo({x: 0.5, y: 0.5}),
            oneshotGestureDefinition = addFlagsToGesture('oneshot'),
            oneshotMotionGesture = createGesture(oneshotGestureDefinition);

        let inputObjects = [movingPointerInput.finished()];
        expect(oneshotMotionGesture.load({node, inputObjects})).to.equal(true);
        expect(oneshotMotionGesture.emitOn()).to.deep.equal([node]);

        sessionId += 1;
        let staticPointerInput = buildInputFromPointer({x: 0, y: 0, sessionId});

        inputObjects = [staticPointerInput.finished()];
        expect(oneshotMotionGesture.load({inputObjects})).to.equal(false);
        expect(oneshotMotionGesture.emitOn()).to.deep.equal([]);

        staticPointerInput.moveTo({x: 0.4, y: 0.4});
        inputObjects = [staticPointerInput.finished()];
        expect(oneshotMotionGesture.load({node, inputObjects})).to.equal(true);
        expect(oneshotMotionGesture.emitOn()).to.deep.equal([node]);
    });

    it(`should trigger events in the first recognized element only, when
            assigned a sticky flag`, () => {
        let sessionId = 10,
            movingPointerInput = buildInputFromPointer({x: 0, y: 0, sessionId})
                                        .moveTo({x: 0.5, y: 0.5}),
            stickyGestureDefinition = addFlagsToGesture('sticky'),
            stickyMotionGesture = createGesture(stickyGestureDefinition);

        let firstNodeToMatch = 'sticky-node',
            inputObjects = [movingPointerInput.finished()];
        // this is normal and already tested
        stickyMotionGesture.load({node: firstNodeToMatch, inputObjects});
        // gesture now return nodes to trigger events on
        // needed for cases such as sticky
        let emitOnNodes = stickyMotionGesture.emitOn();
        expect(emitOnNodes[0]).to.equal(firstNodeToMatch);

        let differentNode = 'new-node';
        movingPointerInput.moveTo({x: 0.7, y: 0.7});
        inputObjects = [movingPointerInput.finished()];
        // load and recognize with a different node
        stickyMotionGesture.load({node: differentNode, inputObjects});
        emitOnNodes = stickyMotionGesture.emitOn();
        // emit on the old node regardless
        expect(emitOnNodes[0]).to.equal(firstNodeToMatch);
    });

    it(`should allow new sticky nodes with new inputObjects`, () => {
        let sessionId = 10,
            movingPointerInput = buildInputFromPointer({x: 0, y: 0, sessionId})
                                        .moveTo({x: 0.5, y: 0.5}),
            stickyGestureDefinition = addFlagsToGesture('sticky'),
            stickyMotionGesture = createGesture(stickyGestureDefinition);

        let firstNodeToMatch = 'sticky-node',
            inputObjects = [movingPointerInput.finished()];
        // this is normal and already tested
        stickyMotionGesture.load({node: firstNodeToMatch, inputObjects});
        // gesture now return nodes to trigger events on
        // needed for cases such as sticky
        let emitOnNodes = stickyMotionGesture.emitOn();
        expect(emitOnNodes[0]).to.equal(firstNodeToMatch);

        sessionId += 1;
        let differentNode = 'new-node',
            newMovingPointerInput = buildInputFromPointer({x: 0, y: 0, sessionId})
                                        .moveTo({x: 0.5, y: 0.5}),
            newInputObjects = [newMovingPointerInput.finished()];
        // load and recognize with a different node
        stickyMotionGesture.load({
            node: differentNode,
            inputObjects: newInputObjects
        });
        emitOnNodes = stickyMotionGesture.emitOn();
        // emit on the new node because input has changed
        expect(emitOnNodes[0]).to.equal(differentNode);
    });

    it(`should not trigger sticky gestures if the inputObjects changes, but
        the gesture conditions not satisifed`, () => {
        let sessionId = 10,
            movingPointerInput = buildInputFromPointer({x: 0, y: 0, sessionId})
                                        .moveTo({x: 0.5, y: 0.5}),
            stickyGestureDefinition = addFlagsToGesture('sticky'),
            stickyMotionGesture = createGesture(stickyGestureDefinition);

        let firstNodeToMatch = 'first-node',
            inputObjects = [movingPointerInput.finished()];
        stickyMotionGesture.load({node: firstNodeToMatch, inputObjects});

        sessionId += 1;
        let secondNodeToMatch = 'second-node',
            staticPointerInput = buildInputFromPointer({x: 0, y: 0, sessionId});

        inputObjects = [staticPointerInput.finished()];
        stickyMotionGesture.load({node: secondNodeToMatch, inputObjects});
        // new inputobjects mean the first node is no longer sticky
        // but staticPointer doesn't match a motion gesture
        expect(stickyMotionGesture.emitOn().length).to.equal(0);
    });
});
