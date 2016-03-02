import {createGesture, gestureException} from '../../source/gesture';
import {clearUserDefinedPaths} from '../../source/feature';
import $ from 'jquery';
import {buildInputFromPointer} from '../helpers/pointer';

describe('gesture', () => {

    let motionGestureDefinition,
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
    
    function addDurationToGesture(duration, gesture = motionGestureDefinition) {
        return $.extend(
            {}, gesture, {duration}
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
    
    it(`should allow setting a duration for a gesture in seconds,
            and store in milliseconds`, () => {
        let duration = [2, 1],
            durationMotionGestureDefinition = addDurationToGesture(duration),
            gesture = createGesture(durationMotionGestureDefinition);
      
       let gestureDuration = gesture.duration();
       expect(gestureDuration.definition).to.deep.equal(duration);
       expect(gestureDuration.start).to.equal(duration[0]*1000);
       expect(gestureDuration.end).to.equal(duration[1]*1000);
    });
    
    it('should throw when setting duration with invalid parameter length', () => {
        let validDurationLengths = [
            [], [1], [1,1]
        ],
            invalidDurationLengths = [
            [1,2,3], [1,2,3,4] // ... and so on
        ];
        
        validDurationLengths.forEach(duration => {
            expect(() => {
                let durationMotionGestureDefinition = addDurationToGesture(duration),
                    gesture = createGesture(durationMotionGestureDefinition);
            }).to.not.throw();
        });
        
        invalidDurationLengths.forEach(duration => {
            expect(() => {
                let durationMotionGestureDefinition = addDurationToGesture(duration);
                createGesture(durationMotionGestureDefinition);
            }).to.throw(Error, new RegExp(gestureException.INVALID_DURATION));
        });
    });
    
    it('should throw when using non-arrays as duration', () => {
        expect(() => {
            let numericalDuration = 0;
            createGesture(
                addDurationToGesture(numericalDuration)
            );
        }).to.throw(Error, new RegExp(gestureException.INVALID_DURATION));
        expect(() => {
            let stringDuration = '0,0';
            createGesture(
                addDurationToGesture(stringDuration)
            );
        }).to.throw(Error, new RegExp(gestureException.INVALID_DURATION));
    });
    
    it('should throw when using non-numeric duration lengths', () => {
        expect(() => {
            let durationOfStrings = ["0"];
            createGesture(
                addDurationToGesture(durationOfStrings)
            );
        }).to.throw(Error, new RegExp(gestureException.INVALID_DURATION));
        
        expect(() => {
            let durationOfStrings = [0, "1"];
            createGesture(
                addDurationToGesture(durationOfStrings)
            );
        }).to.throw(Error, new RegExp(gestureException.INVALID_DURATION));
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
    
    it('should update an object with current values by calling all of its features', () => {
        let gesture = createGesture({
                name: 'gesture',
                features: [
                    {type: 'Motion'},
                    {type: 'Count', constraints: [1,1]},
                ]
            }),
            expectedMotionValue = {x: 1 * window.screen.width,
                                    y: -1 * window.screen.height},
            expectedCountValue = 1;
            
        let inputObjects = [buildInputFromPointer({x: 0, y: 0})
                                .moveTo({x: 1, y: 1})
                                .finished()];
        
        gesture.load({inputObjects});
        
        let data = {};
        gesture.featureValuesToObject(data);
        
        expect(data.count).to.equal(expectedCountValue);
        expect(data.motion).to.deep.equal(expectedMotionValue);
    });
});
