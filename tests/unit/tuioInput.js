import tuioInput from '../../source/tuioInput';
import gispl from '../../source/gispl';

describe('tuioInput', () => {
    
    it('should construct', () => {
        let input = tuioInput();
        expect(input).to.be.an('object');
    });
    
    it('should be able to emit gispl events on dom nodes', () => {
        let spy = sinon.spy();
        gispl(document).on('gesture', spy);
        let input = tuioInput();
        input.emit(document, 'gesture');
        expect(spy.callCount).to.equal(1);
    });

});