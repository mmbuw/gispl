import EventEmitter from 'EventEmitter';

describe('integration: EventEmitter', () => {
    
    function fromEmitterBase() {
        return Object.create(EventEmitter.prototype);
    }
    
    it('should construct', () => {
        let emitter = new EventEmitter();
        expect(emitter).to.be.an('object');
        expect(emitter.on).to.be.a('function');
        expect(emitter.off).to.be.a('function');
    });
    
    it('should be able to inherit from', () => {
        
        let extended = fromEmitterBase();
        expect(extended).to.be.an('object');
        expect(extended.on).to.be.a('function');
        expect(extended.off).to.be.a('function');
    });
    
    it('should be able to listen to events on elements and pass data to callbacks', () => {
        
        let eventObject = fromEmitterBase(),
            spy = sinon.spy();
        
        eventObject.on('testEvent', spy);
        eventObject.emit('testEvent', 1);
        
        expect(spy.calledWith(1)).to.equal(true);
    });
});