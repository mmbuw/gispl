import {createGesture, gestureException} from '../../source/gesture';
import {clearUserDefinedPaths} from '../../source/feature';
import $ from 'jquery';
import {buildInputFromPointer} from '../helpers/pointer';

describe('gesture', () => {

    let motionGestureDefinition,
        trianglePathGestureDefinition,
        node = 'test-dom-node-does-not-matter-if-it-is-a-string',
        nodesToEmitOn = [node],
        mockState = {
            node,
            inputObjects: [null] //should contain e.g. tuio pointers but it doesn't matter
        };

    function addFlagsToGesture(flags, gesture = motionGestureDefinition) {
        return $.extend(
            {}, gesture, {flags}
        );
    }

    beforeEach(() => {
        clearUserDefinedPaths();
        motionGestureDefinition = {
            name: 'motion-gesture',
            features: [
                {type: 'Motion'}
            ]
        };
        trianglePathGestureDefinition = {
            name: 'triangle-path-gesture',
            features: [
                {
                    type: 'Path',
                    constraints: [
                        [0, 100], [0,0], [100, 101], [0, 100]
                    ]
                },
                
            ]
        }
    });

    it('should save the gesture definition and make it retrievable', () => {
        let gesture = createGesture(motionGestureDefinition);
        expect(gesture.definition()).to.deep.equal(motionGestureDefinition);
    });

    it('should instantiate features from gesture definition', () => {
        let gesture = createGesture(motionGestureDefinition);
        expect(gesture.features().length).to.equal(1);
        expect(gesture.features()[0].type()).to.equal('Motion');

        //add more features
        motionGestureDefinition.features.push(motionGestureDefinition.features[0]);

        gesture = createGesture(motionGestureDefinition);
        expect(gesture.features().length).to.equal(2);
    });

    it('should validate gesture by checking all of its features', () => {
        motionGestureDefinition.features.push(motionGestureDefinition.features[0]);
        motionGestureDefinition.features.push(motionGestureDefinition.features[0]);

        let gesture = createGesture(motionGestureDefinition),
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
        let gesture = createGesture(motionGestureDefinition);
        expect(gesture.load()).to.deep.equal([]);
        expect(gesture.load([])).to.deep.equal([]);
        expect(gesture.load({})).to.deep.equal([]);
    });

    it('should validate gesture if the features match', () => {
        motionGestureDefinition.features.push(motionGestureDefinition.features[0]);

        let gesture = createGesture(motionGestureDefinition);

        gesture.features().forEach((feature, index) => {
            return sinon.stub(feature, 'load').returns(true);
        });

        expect(gesture.load(mockState)).to.deep.equal(nodesToEmitOn);
    });

    it('should not validate gesture if at least one feature does not match', () => {
        motionGestureDefinition.features.push(motionGestureDefinition.features[0]);

        let gesture = createGesture(motionGestureDefinition),
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
    
    it(`should store all the nodes encountered when bubble flag set, 
            but not multiple times, i.e. duplicates`, () => {
        let movingPointerInput = buildInputFromPointer({x: 0, y: 0})
                                        .moveTo({x: 0.5, y: 0.5}),
            bubbleGestureDefinition = addFlagsToGesture('bubble'),
            bubbleMotionGesture = createGesture(bubbleGestureDefinition);
        
        // use real node because we also don't want parent duplicates
        let firstNodeToAdd = document.body;
        bubbleMotionGesture.load({
            inputObjects: [movingPointerInput.finished()],
            node: firstNodeToAdd
        });
        bubbleMotionGesture.load({
            inputObjects: [movingPointerInput.finished()],
            node: firstNodeToAdd
        });
        // should already be in
        // because it is the parent of document.body
        let secondNodeToAdd = document.documentElement;
        expect(
            bubbleMotionGesture.load({
                inputObjects: [movingPointerInput.finished()],
                node: secondNodeToAdd
            }) 
        ).to.deep.equal([firstNodeToAdd, document.documentElement, document]);
    });
    
    it(`should be triggered once on all nodes in the path, when
            bubble and oneshot flags set`, () => {
        let triangleMovingPointerInput = buildInputFromPointer({x: 0, y: 0}),
            bubbleOneshotTriangleDefinition = addFlagsToGesture(
                ['bubble', 'oneshot'], trianglePathGestureDefinition
            ),
            bubbleOneshotTriangleGesture = createGesture(bubbleOneshotTriangleDefinition);
            
        let firstNodeInPath = 'first-node';
        bubbleOneshotTriangleGesture.load({
            inputObjects: [triangleMovingPointerInput.finished()],
            node: firstNodeInPath
        });
        let secondNodeInPath = 'second-node';
        triangleMovingPointerInput.moveTo({x: 0, y: 0.5});
        bubbleOneshotTriangleGesture.load({
            inputObjects: [triangleMovingPointerInput.finished()],
            node: secondNodeInPath
        });
        let thirdNodeInPath = 'third-node';
        triangleMovingPointerInput.moveTo({x: 0.5, y: 0})
                                    .moveTo({x: 0, y: 0});
        expect(
            bubbleOneshotTriangleGesture.load({
                inputObjects: [triangleMovingPointerInput.finished()],
                node: thirdNodeInPath
            })
        ).to.deep.equal([firstNodeInPath, secondNodeInPath, thirdNodeInPath]);
        // second time won't work because of oneshot
        expect(
            bubbleOneshotTriangleGesture.load({
                inputObjects: [triangleMovingPointerInput.finished()],
                node: thirdNodeInPath
            })
        ).to.deep.equal([]);
    });
    
    it(`should trigger with bubble and oneshot for the second time,
            if inputObjects change`, () => {
        let sessionId = 10,
            triangleMovingPointerInput = buildInputFromPointer({x: 0, y: 0, sessionId}),
            bubbleOneshotTriangleDefinition = addFlagsToGesture(
                ['bubble', 'oneshot'], trianglePathGestureDefinition
            ),
            bubbleOneshotTriangleGesture = createGesture(bubbleOneshotTriangleDefinition);
            
        let firstNodeInPath = 'first-node';
        bubbleOneshotTriangleGesture.load({
            inputObjects: [triangleMovingPointerInput.finished()],
            node: firstNodeInPath
        });
        let secondNodeInPath = 'second-node';
        triangleMovingPointerInput.moveTo({x: 0, y: 0.5});
        bubbleOneshotTriangleGesture.load({
            inputObjects: [triangleMovingPointerInput.finished()],
            node: secondNodeInPath
        });
        let thirdNodeInPath = 'third-node';
        triangleMovingPointerInput.moveTo({x: 0.5, y: 0})
                                    .moveTo({x: 0, y: 0});
        expect(
            bubbleOneshotTriangleGesture.load({
                inputObjects: [triangleMovingPointerInput.finished()],
                node: thirdNodeInPath
            })
        ).to.deep.equal([firstNodeInPath, secondNodeInPath, thirdNodeInPath]);
        
        // will work again because the sessionId changes -> new input
        triangleMovingPointerInput.newSessionId();
        expect(
            bubbleOneshotTriangleGesture.load({
                inputObjects: [triangleMovingPointerInput.finished()],
                node: thirdNodeInPath
            })
        ).to.deep.equal([thirdNodeInPath]);
    });
    
    it(`should not trigger with bubble and oneshot for the second time,
            if inputObjects change but gesture condition not satisfied`, () => {
        let sessionId = 10,
            triangleMovingPointerInput = buildInputFromPointer({x: 0, y: 0, sessionId}),
            bubbleOneshotTriangleDefinition = addFlagsToGesture(
                ['bubble', 'oneshot'], trianglePathGestureDefinition
            ),
            bubbleOneshotTriangleGesture = createGesture(bubbleOneshotTriangleDefinition);
            
        let firstNodeInPath = 'first-node';
        bubbleOneshotTriangleGesture.load({
            inputObjects: [triangleMovingPointerInput.finished()],
            node: firstNodeInPath
        });
        let secondNodeInPath = 'second-node';
        triangleMovingPointerInput.moveTo({x: 0, y: 0.5});
        bubbleOneshotTriangleGesture.load({
            inputObjects: [triangleMovingPointerInput.finished()],
            node: secondNodeInPath
        });
        let thirdNodeInPath = 'third-node';
        triangleMovingPointerInput.moveTo({x: 0.5, y: 0})
                                    .moveTo({x: 0, y: 0});                            
        bubbleOneshotTriangleGesture.load({
            inputObjects: [triangleMovingPointerInput.finished()],
            node: thirdNodeInPath
        })
        
        // will not work because it is not a valid triangle path
        sessionId += 1;
        let lineMovingPointerInput = buildInputFromPointer({x: 0, y: 0, sessionId})
                                        .moveTo({x: 0.5, y: 0.5});
        expect(
            bubbleOneshotTriangleGesture.load({
                inputObjects: [lineMovingPointerInput.finished()],
                node: thirdNodeInPath
            })
        ).to.deep.equal([]);
    });
    
    it(`should be triggered on the original node only once,
            if oneshot and sticky flags set`, () => {
        let triangleMovingPointerInput = buildInputFromPointer({x: 0, y: 0})
                                            .moveTo({x: 0, y: 0.5})
                                            .moveTo({x: 0.5, y: 0})
                                            .moveTo({x: 0, y: 0}),
            stickyOneshotTriangleDefinition = addFlagsToGesture(
                ['sticky', 'oneshot'], trianglePathGestureDefinition
            ),
            stickyOneshotTriangleGesture = createGesture(stickyOneshotTriangleDefinition);
            
        let stickyNode = 'sticky-node';
        expect(
            stickyOneshotTriangleGesture.load({
                inputObjects: [triangleMovingPointerInput.finished()],
                node: stickyNode
            })
        ).to.deep.equal([stickyNode]);
        
        expect(
            stickyOneshotTriangleGesture.load({
                inputObjects: [triangleMovingPointerInput.finished()],
                node: stickyNode
            })   
        ).to.deep.equal([]); 
    });
    
    it(`should be triggered again if oneshot and sticky flags set,
            and inputObjects change`, () => {
        let sessionId = 10,
            triangleMovingPointerInput = buildInputFromPointer({x: 0, y: 0, sessionId})
                                            .moveTo({x: 0, y: 0.5})
                                            .moveTo({x: 0.5, y: 0})
                                            .moveTo({x: 0, y: 0}),
            stickyOneshotTriangleDefinition = addFlagsToGesture(
                ['sticky', 'oneshot'], trianglePathGestureDefinition
            ),
            stickyOneshotTriangleGesture = createGesture(stickyOneshotTriangleDefinition);
            
        let stickyNode = 'sticky-node';
        stickyOneshotTriangleGesture.load({
            inputObjects: [triangleMovingPointerInput.finished()],
            node: stickyNode
        });
        
        triangleMovingPointerInput.newSessionId();
        
        expect(
            stickyOneshotTriangleGesture.load({
                inputObjects: [triangleMovingPointerInput.finished()],
                node: stickyNode
            })   
        ).to.deep.equal([stickyNode]);
    });
    
    it(`should not be triggered if oneshot and sticky flags set,
            and gesture condition not satisfied`, () => {
        let sessionId = 10,
            triangleMovingPointerInput = buildInputFromPointer({x: 0, y: 0, sessionId})
                                            .moveTo({x: 0, y: 0.5})
                                            .moveTo({x: 0.5, y: 0})
                                            .moveTo({x: 0, y: 0}),
            stickyOneshotTriangleDefinition = addFlagsToGesture(
                ['sticky', 'oneshot'], trianglePathGestureDefinition
            ),
            stickyOneshotTriangleGesture = createGesture(stickyOneshotTriangleDefinition);
            
        let stickyNode = 'sticky-node';
        stickyOneshotTriangleGesture.load({
            inputObjects: [triangleMovingPointerInput.finished()],
            node: stickyNode
        });
        
        sessionId += 1;
        let lineMovingPointerInput = buildInputFromPointer({x: 0, y: 0, sessionId})
                                       .moveTo({x: 0.5, y: 0.5});
        expect(
            stickyOneshotTriangleGesture.load({
                inputObjects: [triangleMovingPointerInput.finished()],
                node: stickyNode
            })
        ).to.deep.equal([]);
    });
    
    it(`should trigger gesture on all nodes in path if bubble and sticky flag set
            because bubble takes precedence`, () => {
                
        let movingPointerInput = buildInputFromPointer({x: 0, y: 0})
                                        .moveTo({x: 0.5, y: 0.5}),
            bubbleStickyGestureDefinition = addFlagsToGesture(['bubble','sticky']),
            bubbleStickyMotionGesture = createGesture(bubbleStickyGestureDefinition);

        let firstNodeToAdd = 'first-node';
        bubbleStickyMotionGesture.load({
            node: firstNodeToAdd,
            inputObjects: [movingPointerInput.finished()]
        });
        
        let secondNodeToAdd = 'second-node';
        expect(
            bubbleStickyMotionGesture.load({
                node: secondNodeToAdd,
                inputObjects: [movingPointerInput.finished()]
            })
        ).to.deep.equal([firstNodeToAdd, secondNodeToAdd]);
    });
    
    it(`should be triggered on new nodes if bubble and sticky flags set,
            and inputObjects change`, () => {
                
        let sessionId = 10,
            movingPointerInput = buildInputFromPointer({x: 0, y: 0, sessionId})
                                        .moveTo({x: 0.5, y: 0.5}),
            bubbleStickyGestureDefinition = addFlagsToGesture(['bubble','sticky']),
            bubbleStickyMotionGesture = createGesture(bubbleStickyGestureDefinition);

        let firstNodeToAdd = 'first-node';
        bubbleStickyMotionGesture.load({
            node: firstNodeToAdd,
            inputObjects: [movingPointerInput.finished()]
        });
        
        let secondNodeToAdd = 'second-node';
        bubbleStickyMotionGesture.load({
            node: secondNodeToAdd,
            inputObjects: [movingPointerInput.finished()]
        });
        
        let onlyNode = 'only-node';
        movingPointerInput.newSessionId();
        expect(
            bubbleStickyMotionGesture.load({
                node: onlyNode,
                inputObjects: [movingPointerInput.finished()]
            })
        ).to.deep.equal([onlyNode]);
    });
    
    it(`should not be triggered if bubble and sticky flags set,
            and gesture condition not satisfied`, () => {
        let sessionId = 10,
            movingPointerInput = buildInputFromPointer({x: 0, y: 0, sessionId})
                                        .moveTo({x: 0.5, y: 0.5}),
            bubbleStickyGestureDefinition = addFlagsToGesture(['bubble','sticky']),
            bubbleStickyMotionGesture = createGesture(bubbleStickyGestureDefinition);

        let firstNodeToAdd = 'first-node';
        bubbleStickyMotionGesture.load({
            node: firstNodeToAdd,
            inputObjects: [movingPointerInput.finished()]
        });
        
        sessionId += 1;
        let staticPointerInput = buildInputFromPointer({x: 0, y: 0, sessionId})
        expect(
            bubbleStickyMotionGesture.load({
                node: firstNodeToAdd,
                inputObjects: [staticPointerInput.finished()]
            })
        ).to.deep.equal([]);
    });
    
    it(`should trigger gesture events on multiple nodes once if 
            bubble, sticky and oneshot flags set`, () => {
        let triangleMovingPointerInput = buildInputFromPointer({x: 0, y: 0})
                                            .moveTo({x: 0, y: 0.5}),
            bubbleStickyOneshotTriangleDefinition = addFlagsToGesture(
                ['sticky', 'oneshot', 'bubble'], trianglePathGestureDefinition
            ),
            bubbleStickyOneshotTriangleGesture = createGesture(
                bubbleStickyOneshotTriangleDefinition
            );
            
        let firstNodeToAdd = 'first-node';
        expect(
            bubbleStickyOneshotTriangleGesture.load({
                inputObjects: [triangleMovingPointerInput.finished()],
                node: firstNodeToAdd
            })
        ).to.deep.equal([]);
        let secondNodeToAdd = 'second-node';
        // will match on next gesture check
        triangleMovingPointerInput.moveTo({x: 0.5, y: 0})
                                    .moveTo({x: 0, y: 0});
        expect(
            bubbleStickyOneshotTriangleGesture.load({
                inputObjects: [triangleMovingPointerInput.finished()],
                node: secondNodeToAdd
            })
        ).to.deep.equal([firstNodeToAdd, secondNodeToAdd]);
        
        // will not work anymore until input changes
        // oneshot set
        expect(
            bubbleStickyOneshotTriangleGesture.load({
                inputObjects: [triangleMovingPointerInput.finished()],
                node: secondNodeToAdd
            })
        ).to.deep.equal([]);
    });
    
    it(`should trigger gesture event again on multiple nodes once if 
            bubble, sticky and oneshot flags set and inputObjects change`, () => {
        let sessionId = 10,
            triangleMovingPointerInput = buildInputFromPointer({x: 0, y: 0, sessionId})
                                            .moveTo({x: 0, y: 0.5}),
            bubbleStickyOneshotTriangleDefinition = addFlagsToGesture(
                ['sticky', 'oneshot', 'bubble'], trianglePathGestureDefinition
            ),
            bubbleStickyOneshotTriangleGesture = createGesture(
                bubbleStickyOneshotTriangleDefinition
            );
            
        let firstNodeToAdd = 'first-node';
        bubbleStickyOneshotTriangleGesture.load({
            inputObjects: [triangleMovingPointerInput.finished()],
            node: firstNodeToAdd
        });
        let secondNodeToAdd = 'second-node';
        // will match on next gesture check
        triangleMovingPointerInput.moveTo({x: 0.5, y: 0})
                                    .moveTo({x: 0, y: 0});
        bubbleStickyOneshotTriangleGesture.load({
            inputObjects: [triangleMovingPointerInput.finished()],
            node: secondNodeToAdd
        });
        
        // changing sessionId should reset everything
        triangleMovingPointerInput.newSessionId();
        let someOtherNode = 'other-node';
        expect(
            bubbleStickyOneshotTriangleGesture.load({
                inputObjects: [triangleMovingPointerInput.finished()],
                node: someOtherNode
            })
        ).to.deep.equal([someOtherNode]);
    });
    
    it(`should not trigger gesture event if bubble, sticky, oneshot flags set,
            but gesture condition not satisfied`, () => {
        let sessionId = 10,
            triangleMovingPointerInput = buildInputFromPointer({x: 0, y: 0, sessionId})
                                            .moveTo({x: 0, y: 0.5})
                                            .moveTo({x: 0.5, y: 0})
                                            .moveTo({x: 0, y: 0}),
            bubbleStickyOneshotTriangleDefinition = addFlagsToGesture(
                ['sticky', 'oneshot', 'bubble'], trianglePathGestureDefinition
            ),
            bubbleStickyOneshotTriangleGesture = createGesture(
                bubbleStickyOneshotTriangleDefinition
            );
            
        let someNode = 'some-node';
        bubbleStickyOneshotTriangleGesture.load({
            inputObjects: [triangleMovingPointerInput.finished()],
            node: someNode
        });
        
        sessionId += 1;
        let lineMovingPointerInput = buildInputFromPointer({x: 0, y: 0, sessionId})
                                       .moveTo({x: 0.5, y: 0.5});
        expect(
            bubbleStickyOneshotTriangleGesture.load({
                inputObjects: [triangleMovingPointerInput.finished()],
                node: someNode
            })
        ).to.deep.equal([]);
    });
    
    it('should trigger gesture event on parent element if propagation enabled', () => {
        // propagation is enabled by default
        let gesture = createGesture(motionGestureDefinition);

        gesture.features().forEach((feature, index) => {
            return sinon.stub(feature, 'load').returns(true);
        });
        
        let mockInput = [null],
            node = document.body;
        expect(gesture.load({
            inputObjects: mockInput,
            node
        })).to.deep.equal([node, document.documentElement, document]);
    });
    
    it('should not trigger gesture event on parent element if propagation disabled', () => {
        let gesture = createGesture($.extend(
            {}, motionGestureDefinition, {propagation: false}
        ));

        gesture.features().forEach((feature, index) => {
            return sinon.stub(feature, 'load').returns(true);
        });
        
        let mockInput = [null],
            node = document.body;
        expect(gesture.load({
            inputObjects: mockInput,
            node
        })).to.deep.equal([node]);
    });
});
