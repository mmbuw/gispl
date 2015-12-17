let eventCache = {
    map: new WeakMap(),
    getListeners: function(params = {}) {
        let {element, event} = params;
        
        let cachedEvents = this.map.get(element);
        if (typeof cachedEvents === 'undefined') {
            cachedEvents = {};
            this.map.set(element, cachedEvents);
        }
        
        let cachedListeners = cachedEvents[event];
        if (typeof cachedListeners === 'undefined') {
            cachedListeners = [];
            cachedEvents[event] = cachedListeners;
        }
        
        return cachedListeners;
    },
    callListeners: function(params = {}) {
        let {args} = params;
        this.getListeners(params)
            .forEach(listener => listener(...args));
    },
    addListener: function(params = {}) {
        let {listener} = params;
        if (typeof listener === 'function') {
            this.getListeners(params).push(listener);   
        }
    }
};

export default function eventEmitter(object = {}) {
    
    let eventApi = object;
    
    eventApi.on = function eventOn(event, listener) {
        this.forEach((element) => {
            eventCache.addListener({element, event, listener});
        });
    };
    
    eventApi.emit = function eventEmit(event, ...args) {
        this.forEach((element) => {
            eventCache.callListeners({element, event, args});
        });
    };
    
    return eventApi;
}