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
        
        gispl(selectedElement).on('custom-event', spy);
        gispl(selectedElement).emit('custom-event');
        expect(spy.callCount).to.equal(1);
    });
    
    it('should accept multiple listeners on the same event', () => {        
        let element = gispl(document),
            spy = sinon.spy();
        
        element.on('event', spy);
        element.on('event', spy);
        element.emit('event');
        
        expect(spy.callCount).to.equal(2);
    });
    
    it('should pass parameters to register listeners', () => {
        
        let element = gispl(document),
            spy = sinon.spy();
        
        element.on('event', spy);
        
        element.emit('event', 1);
        expect(spy.lastCall.calledWith(1)).to.equal(true);
        
        element.emit('event', 1, 2, 3);
        expect(spy.lastCall.calledWith(1, 2, 3)).to.equal(true);
    });
    
    it('should not add anything except functions as listeners', () => {
        
        let element = gispl(document);
        
        element.on('event');
        expect(function() {
            element.emit('event');
        }).to.not.throw();
        
        element.on('event', {});
        expect(function() {
            element.emit('event');
        }).to.not.throw();
    });
});