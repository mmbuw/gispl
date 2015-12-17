let eventCache = new WeakMap();

export default function eventEmitter(object = {}) {
    
    let eventApi = object;
    
    eventApi.on = function eventOn(event, listener) {
        this.forEach((element) => {
            let cachedEvents = eventCache.get(element);
            if (typeof cachedEvents === 'undefined') {
                cachedEvents = {};
                eventCache.set(element, cachedEvents);
            };
            let cachedListeners = cachedEvents[event] || [];
            cachedListeners.push(listener);
            cachedEvents[event] = cachedListeners;
        });
    };
    
    eventApi.emit = function eventEmit(event, ...args) {
        this.forEach((element) => {
            let cachedEvents = eventCache.get(element);
            if (typeof cachedEvents !== 'undefined') {
                let listeners = cachedEvents[event];
                listeners.forEach(
                    listener => listener(...args)
                );
            }
        });
    };
    
    return eventApi;
}