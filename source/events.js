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

export let events = {
    emit: function eventEmit(element, event, ...args) {
        globalEventCache.callListeners({element,
                                            event,
                                            args});
    },
    on: function eventOn(element, event, listener) {
        globalEventCache.addListener({element,
                                        event,
                                        listener});

    },
    off: function eventOff(element, event, listener) {
        globalEventCache.removeListeners({element,
                                            event,
                                            listener});
    },
    clearGlobalEventsCache: function eventClearGlobalCache() {
        globalEventCache.clear();
    }
};

export function domCollectionEvents(object = {}) {

    object.on = function collectionEventOn(event, listener) {
        this.forEach(element => events.on(element,
                                            event,
                                            listener));
    };

    object.off = function collectionEventOff(event, listener) {
        this.forEach(element => events.off(element,
                                            event,
                                            listener));
    };

    object.emit = function collectionEventEmit(event, ...args) {
        this.forEach(element => events.emit(element,
                                                event,
                                                ...args)
        );
    };

    return object;
}
