import gispl from '../../source/gispl';
import eventEmitter from '../../source/eventEmitter';

describe('gispl event emitting', () => {
    
    let testGispl;
    
    beforeEach(() => {
        testGispl = gispl();
    });
    
    it('should construct', () => {        
        expect(eventEmitter()).to.be.an('object');
    });
    
    it('should extend objects passed into it', () => {
        expect(eventEmitter({})).to.be.an('object');        
        let testEmitter = eventEmitter({prop: 1});
        expect(testEmitter.prop).to.equal(1);
    });
    
    it('should have basic event on/off/emit capabilities', () => {
        let spy = sinon.spy();
        
        testGispl.add(document);
        testGispl.on('custom-event', spy);
        testGispl.emit('custom-event');
        expect(spy.callCount).to.equal(1);
    });
    
    it('should trigger events even if elements are in different gispl objects', () => {
        let selectedElement = document,
            spy = sinon.spy();
        
        gispl(document).on('custom-event', spy);
        gispl(document).emit('custom-event');
        expect(spy.callCount).to.equal(1);
    });
});