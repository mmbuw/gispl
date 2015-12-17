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
    },
    removeListener: function(params = {}) {
        let {element, event, listener} = params,
            listeners = this.getListeners(params);
        
        let indexOfListener = listeners.indexOf(listener);
        if (indexOfListener !== -1) {
            listeners.splice(indexOfListener, 1);
        }
    },
    removeListeners: function(params = {}) {
        let {element, event, listener} = params;
        
        if (typeof listener !== 'undefined') {
            this.removeListener(params);
            return;
        }
        
        let cachedEvents = this.map.get(element);
        if (typeof cachedEvents !== 'undefined') {
            delete cachedEvents[event];   
        }
    },
    clear: function() {
        this.map = new WeakMap();
    }
};

export default function eventEmitter(object = {}) {
    
    let eventApi = object;
    
    eventApi.on = function eventOn(event, listener) {
        this.forEach((element) => {
            eventCache.addListener({element, event, listener});
        });
    };
    
    eventApi.off = function eventOff(event, listener) {
        this.forEach((element) => {
            eventCache.removeListeners({element, event, listener});
        });
    };
    
    eventApi.emit = function eventEmit(event, ...args) {
        this.forEach((element) => {
            eventCache.callListeners({element, event, args});
        });
    };
    
    eventApi.clearGlobalEventsCache = function eventClearGlobalCache() {
        eventCache.clear();
    };
    
    return eventApi;
}