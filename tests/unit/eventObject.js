import {createEventObject} from '../../source/eventObject';

describe('event object', () => {
    
    let defaultEvent = createEventObject();
    
    it('should construct', () => {
        expect(defaultEvent).to.be.an('object');
    });
    
    it('should always contain an input state property', () => {
        expect(
            defaultEvent.hasOwnProperty('input')
        ).to.equal(true);
    });
    
    it('should contain valid current input state information', () => {
        let inputObjects = {},
            event = createEventObject({inputObjects});
        expect(event.input).to.equal(inputObjects);
    });
    
    it('should contain feature value information', () => {
        expect(defaultEvent.featureValues).to.be.an('object');
    });
    
    it('should contain scale value information', () => {
        expect(
            defaultEvent.featureValues.hasOwnProperty('scale')
        ).to.equal(true);
    });
    
    it('should contain motion value information', () => {
        expect(
            defaultEvent.featureValues.hasOwnProperty('motion')
        ).to.equal(true);
    });
    
    it('should contain motion value information', () => {
        expect(
            defaultEvent.featureValues.hasOwnProperty('path')
        ).to.equal(true);
    });
    
    it('should contain motion value information', () => {
        expect(
            defaultEvent.featureValues.hasOwnProperty('count')
        ).to.equal(true);
    });
    
    it('should contain motion value information', () => {
        expect(
            defaultEvent.featureValues.hasOwnProperty('rotation')
        ).to.equal(true);
    });
});