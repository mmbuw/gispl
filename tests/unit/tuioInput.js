import tuioInput from '../../source/tuioInput';
import gispl from '../../source/gispl';

describe('tuioInput', () => {
    
    it('should construct', () => {
        let input = tuioInput();
        expect(input).to.be.an('object');
    });
    
    it('should be able to emit gispl events on dom nodes and pass data', () => {
        let spy = sinon.spy(),
            gestureName = 'gesture';
        
        gispl(document).on(gestureName, spy);
        
        let input = tuioInput(),
            gestureData = {data: 1};
        input.emit(document, gestureName);
        expect(spy.callCount).to.equal(1);
        
        input.emit(document, gestureName, gestureData, gestureData);
        expect(spy.callCount).to.equal(2);
        expect(spy.lastCall.args.length).to.equal(2);
        expect(spy.lastCall.args[0]).to.deep.equal(gestureData);
        expect(spy.lastCall.args[1]).to.deep.equal(gestureData);
    });

});