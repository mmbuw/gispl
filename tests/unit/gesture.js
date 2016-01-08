import {createGesture} from '../../source/gesture';
import $ from 'jquery';

describe('gesture', () => {
    
    let gestureDefinition = {
        name: 'someGestureName',
        features: [
            {type: 'Motion'}
        ]
    };
    
    it('should save the gesture definition and make it retrievable', () => {
        let gesture = createGesture(gestureDefinition);
        expect(gesture.definition()).to.deep.equal(gestureDefinition);
    });
    
    it('should instantiate features from gesture definition', () => {
        let gesture = createGesture(gestureDefinition);
        expect(gesture.features().length).to.equal(1);
        expect(gesture.features()[0].type()).to.equal('Motion');
        
        //add more features
        let anotherDefinition = $.extend({}, gestureDefinition);
        anotherDefinition.features.push(anotherDefinition.features[0]);
        
        gesture = createGesture(gestureDefinition);
        expect(gesture.features().length).to.equal(2);
    });
});