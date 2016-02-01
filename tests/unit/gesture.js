import {createGesture, gestureException} from '../../source/gesture';
import $ from 'jquery';
import {buildInputFromPointer} from '../helpers/pointer';

describe('gesture', () => {

    let gestureDefinition,
        node = 'test-dom-node-does-not-matter-if-it-is-a-string',
        nodesToEmitOn = [node],
        mockState = {
            node,
            inputObjects: [null] //should contain e.g. tuio pointers but it doesn't matter
        };

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

        gesture.load(mockState);

        mockedFeatures.every(mockedFeature => {
            mockedFeature.verify();
        });
    });

    it('should return false when passed no, empty, or invalid inputState', () => {
        let gesture = createGesture(gestureDefinition);
        expect(gesture.load()).to.deep.equal([]);
        expect(gesture.load([])).to.deep.equal([]);
        expect(gesture.load({})).to.deep.equal([]);
    });

    it('should validate gesture if the features match', () => {
        gestureDefinition.features.push(gestureDefinition.features[0]);

        let gesture = createGesture(gestureDefinition);

        gesture.features().forEach((feature, index) => {
            return sinon.stub(feature, 'load').returns(true);
        });

        expect(gesture.load(mockState)).to.deep.equal(nodesToEmitOn);
    });

    it('should not validate gesture if at least one feature does not match', () => {
        gestureDefinition.features.push(gestureDefinition.features[0]);

        let gesture = createGesture(gestureDefinition),
            returnValues = [true, false];

        gesture.features().forEach((feature, index) => {
            return sinon.stub(feature, 'load').returns(returnValues[index]);
        });

        expect(gesture.load(mockState)).to.deep.equal([]);
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
        expect(oneshotMotionGesture.load({node, inputObjects})).to.deep.equal(nodesToEmitOn);

        movingPointerInput.moveTo({x: 0.4, y: 0.4});
        inputObjects = [movingPointerInput.finished()];
        expect(oneshotMotionGesture.load({inputObjects})).to.deep.equal([]);
    });

    it('should trigger the gesture again despite oneshot if the inputObjects change', () => {
        let sessionId = 10,
            movingPointerInput = buildInputFromPointer({x: 0, y: 0, sessionId})
                                        .moveTo({x: 0.5, y: 0.5}),
            oneshotGestureDefinition = addFlagsToGesture('oneshot'),
            oneshotMotionGesture = createGesture(oneshotGestureDefinition);

        let inputObjects = [movingPointerInput.finished()];
        expect(oneshotMotionGesture.load({node, inputObjects})).to.deep.equal(nodesToEmitOn);

        sessionId += 1;
        let newMovingPointerInput = buildInputFromPointer({x: 0, y: 0, sessionId})
                                        .moveTo({x: 0.5, y: 0.5});

        inputObjects = [newMovingPointerInput.finished()];
        expect(oneshotMotionGesture.load({node, inputObjects})).to.deep.equal(nodesToEmitOn);

        newMovingPointerInput.moveTo({x: 0.4, y: 0.4});
        inputObjects = [newMovingPointerInput.finished()];
        expect(oneshotMotionGesture.load({inputObjects})).to.deep.equal([]);
    });

    it(`should not trigger oneshot gestures if the inputObjects change, but
        the gesture conditions not satisifed`, () => {
        // more of a check that nothing has gone wrong after oneshot was implemented
        let sessionId = 10,
            movingPointerInput = buildInputFromPointer({x: 0, y: 0, sessionId})
                                        .moveTo({x: 0.5, y: 0.5}),
            oneshotGestureDefinition = addFlagsToGesture('oneshot'),
            oneshotMotionGesture = createGesture(oneshotGestureDefinition);

        let inputObjects = [movingPointerInput.finished()];
        expect(oneshotMotionGesture.load({node, inputObjects})).to.deep.equal(nodesToEmitOn);

        sessionId += 1;
        let staticPointerInput = buildInputFromPointer({x: 0, y: 0, sessionId});

        inputObjects = [staticPointerInput.finished()];
        expect(oneshotMotionGesture.load({node, inputObjects})).to.deep.equal([]);

        staticPointerInput.moveTo({x: 0.4, y: 0.4});
        inputObjects = [staticPointerInput.finished()];
        expect(oneshotMotionGesture.load({node, inputObjects})).to.deep.equal(nodesToEmitOn);
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

        expect(
            stickyMotionGesture.load({
                node: firstNodeToMatch,
                inputObjects
            })
        ).to.deep.equal([firstNodeToMatch]);

        let differentNode = 'new-node';
        movingPointerInput.moveTo({x: 0.7, y: 0.7});
        inputObjects = [movingPointerInput.finished()];

        expect(
            stickyMotionGesture.load({
                node: differentNode,
                inputObjects
            })
        ).to.deep.equal([firstNodeToMatch]);
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
        expect(
            stickyMotionGesture.load({
                node: firstNodeToMatch,
                inputObjects
            })
        ).to.deep.equal([firstNodeToMatch])

        sessionId += 1;
        let differentNode = 'new-node',
            newMovingPointerInput = buildInputFromPointer({x: 0, y: 0, sessionId})
                                        .moveTo({x: 0.5, y: 0.5}),
            newInputObjects = [newMovingPointerInput.finished()];
        // load and recognize with a different node
        expect(
            stickyMotionGesture.load({
                node: differentNode,
                inputObjects: newInputObjects
            })
        ).to.deep.equal([differentNode]);
    });

    it(`should not trigger sticky gestures if the inputObjects change, but
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
        expect(
            stickyMotionGesture.load({
                node: secondNodeToMatch,
                inputObjects
            })
        ).to.deep.equal([]);
    });
    
    it(`should trigger events in all crossed nodes,
            when assigned the bubble flag`, () => {
        let sessionId = 10,
            movingPointerInput = buildInputFromPointer({x: 0, y: 0, sessionId})
                                    .moveTo({x: 0.5, y: 0.5}),
            bubbleGestureDefinition = addFlagsToGesture('bubble'),
            bubbleMotionGesture = createGesture(bubbleGestureDefinition);
        
        let firstNodeToAdd = 'first-node',
            inputObjects = [movingPointerInput.finished()];
        expect(
            bubbleMotionGesture.load({
                inputObjects,
                node: firstNodeToAdd
            })
        ).to.deep.equal([firstNodeToAdd]);
        
        let secondNodeToAdd = 'second-node';
        expect(
            bubbleMotionGesture.load({
                inputObjects,
                node: secondNodeToAdd
            })
        ).to.deep.equal([firstNodeToAdd, secondNodeToAdd]);
    });
    
    it(`should trigger events in all crossed nodes with the bubble flag,
            even if event on that node was not recognized`, () => {
        let sessionId = 10,
            staticPointerInput = buildInputFromPointer({x: 0, y: 0, sessionId})
                                    .moveTo({x: 0, y: 0}),
            bubbleGestureDefinition = addFlagsToGesture('bubble'),
            bubbleMotionGesture = createGesture(bubbleGestureDefinition);
        
        let firstNodeToAdd = 'first-node';
        expect(
            bubbleMotionGesture.load({
                inputObjects: [staticPointerInput.finished()],
                node: firstNodeToAdd
            })
        ).to.deep.equal([]);
        
        let secondNodeToAdd = 'second-node',
            movingPointerInput = staticPointerInput
                                    .moveTo({x: 0.5, y: 0.5});
        expect(
            bubbleMotionGesture.load({
                inputObjects: [movingPointerInput.finished()],
                node: secondNodeToAdd
            })
        ).to.deep.equal([firstNodeToAdd, secondNodeToAdd]);
    });
    
    it(`should trigger events in all crossed nodes with the bubble flag,
            even if there is just one node`, () => {
        let movingPointerInput = buildInputFromPointer({x: 0, y: 0})
                                    .moveTo({x: 0.5, y: 0.5})
                                    .finished(),
            bubbleGestureDefinition = addFlagsToGesture('bubble'),
            bubbleMotionGesture = createGesture(bubbleGestureDefinition);
        
        let onlyNodeToAdd = 'only-node';
        expect(
            bubbleMotionGesture.load({
                inputObjects: [movingPointerInput],
                node: onlyNodeToAdd
            })
        ).to.deep.equal([onlyNodeToAdd]);
    });

    it(`should reset the known nodes when bubble flag set,
            and input changes`, () => {
        let sessionId = 10,
            movingPointerInput = buildInputFromPointer({x: 0, y: 0, sessionId})
                                        .moveTo({x: 0.5, y: 0.5}),
            bubbleGestureDefinition = addFlagsToGesture('bubble'),
            bubbleMotionGesture = createGesture(bubbleGestureDefinition);
        
        let firstNodeToAdd = 'first-node',
            secondNodeToAdd = 'second-node',
            inputObjects = [movingPointerInput.finished()];
            
        bubbleMotionGesture.load({
            inputObjects,
            node: firstNodeToAdd
        });
        bubbleMotionGesture.load({
            inputObjects,
            node: secondNodeToAdd
        });
        
        sessionId += 1;
        let thirdNodeToAdd = 'third-node',
            fourthNodeToAdd = 'fourth-node',
            newMovingPointerInput = buildInputFromPointer({x: 0, y: 0, sessionId})
                                        .moveTo({x: 0.5, y: 0.5}),
            newInputObjects = [newMovingPointerInput.finished()];
        bubbleMotionGesture.load({
            node: thirdNodeToAdd,
            inputObjects: newInputObjects
        })
        expect(
            bubbleMotionGesture.load({
                node: fourthNodeToAdd,
                inputObjects: newInputObjects
            })
        ).to.deep.equal([thirdNodeToAdd, fourthNodeToAdd]);
    });
    
    it(`should not trigger gestures when bubble flag set,
            but gesture condition not satisfied`, () => {
        let sessionId = 10,
            movingPointerInput = buildInputFromPointer({x: 0, y: 0, sessionId})
                                        .moveTo({x: 0.5, y: 0.5}),
            bubbleGestureDefinition = addFlagsToGesture('bubble'),
            bubbleMotionGesture = createGesture(bubbleGestureDefinition);
            
        let firstNodeToAdd = 'first-node',
            secondNodeToAdd = 'second-node',
            inputObjects = [movingPointerInput.finished()];
            
        bubbleMotionGesture.load({
            inputObjects,
            node: firstNodeToAdd
        });
        bubbleMotionGesture.load({
            inputObjects,
            node: secondNodeToAdd
        });

        sessionId += 1;
        let thirdNodeToAdd = 'third-node',
            staticPointerInput = buildInputFromPointer({x: 0, y: 0, sessionId});

        inputObjects = [staticPointerInput.finished()];
        expect(
            bubbleMotionGesture.load({
                node: thirdNodeToAdd,
                inputObjects
            })
        ).to.deep.equal([]);
    });
});
