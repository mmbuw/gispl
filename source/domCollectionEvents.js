let globalEventCache = {
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
        let {listener} = params,
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

export default function domCollectionEvents(object = {}) {
    
    object.on = function eventOn(event, listener) {
        this.forEach((element) => {
            globalEventCache.addListener({element, event, listener});
        });
    };
    
    object.off = function eventOff(event, listener) {
        this.forEach((element) => {
            globalEventCache.removeListeners({element, event, listener});
        });
    };
    
    object.emit = function eventEmit(event, ...args) {
        this.forEach((element) => {
            globalEventCache.callListeners({element, event, args});
        });
    };
    
    object.clearGlobalEventsCache = function eventClearGlobalCache() {
        globalEventCache.clear();
    };
    
    return object;
}