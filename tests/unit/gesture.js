import {createGesture, gestureException} from '../../source/gesture';
import {clearUserDefinedPaths} from '../../source/feature';
import $ from 'jquery';

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
