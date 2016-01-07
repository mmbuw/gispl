import {createGesture} from '../../source/gesture';

describe('gesture', () => {
    
    let gestureDefinition = {
        name: 'someGestureName',
        features: [
            {type:"Count", constraints:[0,0], duration:[150,100], result:[] }
        ]
    };
    
    it('should save the gesture definition and make it retrievable', () => {
        let gesture = createGesture(gestureDefinition);
        expect(gesture.definition()).to.deep.equal(gestureDefinition);
    });
});