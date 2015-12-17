let eventCache = new WeakMap();

export default function eventEmitter(object = {}) {
    
    let eventApi = object;
    
    eventApi.on = function eventOn(event, listener) {
        for(let i = 0, length = this.length; i < length; i += 1) {
            let cachedEvent = {};
            cachedEvent[event] = listener;
            eventCache.set(this[i], cachedEvent);
        }
    };
    
    eventApi.emit = function eventEmit(event, ...args) {
        for(let i = 0, length = this.length; i < length; i += 1) {
            let cachedEvents = eventCache.get(this[0]);
            if (typeof cachedEvents !== 'undefined') {
                let listener = cachedEvents[event];
                listener(...args);
            }
        }
    };
    
    return eventApi;
}