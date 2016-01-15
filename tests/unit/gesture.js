import {createGesture} from '../../source/gesture';
import $ from 'jquery';

describe('gesture', () => {

    let gestureDefinition;

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

        let mockState;
        gesture.load(mockState);

        mockedFeatures.every(mockedFeature => {
            mockedFeature.verify();
        });
    });

    it('should validate gesture if the features match', () => {
        gestureDefinition.features.push(gestureDefinition.features[0]);

        let gesture = createGesture(gestureDefinition);

        gesture.features().forEach((feature, index) => {
            return sinon.stub(feature, 'load').returns(true);
        });

        let mockState;
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
});
