let globalEventCache = {
    map: new WeakMap(),
    getListeners(element, event) {
        
        let cachedEvents = this.map.get(element);
        if (typeof cachedEvents === 'undefined') {
            cachedEvents = new Map();
            this.map.set(element, cachedEvents);
        }

        let cachedListeners = cachedEvents[event];
        if (typeof cachedListeners === 'undefined') {
            cachedListeners = [];
            cachedEvents[event] = cachedListeners;
        }

        return cachedListeners;
    },
    callListeners(element, event, args) {
        let listeners = this.getListeners(element, event);
        for (let i = 0; i < listeners.length; i += 1) {
            listeners[i].apply(element, args);
        }
    },
    addListener(element, event, listener) {
        if (typeof listener === 'function') {
            this.getListeners(element, event).push(listener);
        }
    },
    removeListener(element, event, listener) {
        let listeners = this.getListeners(element, event);

        let indexOfListener = listeners.indexOf(listener);
        if (indexOfListener !== -1) {
            listeners.splice(indexOfListener, 1);
        }
    },
    removeListeners(element, event, listener) {
        if (typeof listener !== 'undefined') {
            this.removeListener(element, event, listener);
            return;
        }
        
        let cachedEvents = this.map.get(element);
        if (typeof cachedEvents !== 'undefined') {
            delete cachedEvents[event];
        }
    },
    clear() {
        this.map = new WeakMap();
    }
};

export let events = {
    emit(element, event, ...args) {
        globalEventCache.callListeners(element, event, args);
    },
    on(element, event, listener) {
        globalEventCache.addListener(element, event, listener);

    },
    off(element, event, listener) {
        globalEventCache.removeListeners(element, event, listener);
    },
    clearGlobalEventsCache() {
        globalEventCache.clear();
    }
};

export function domCollectionEvents(object = {}) {

    object.on = function collectionEventOn(event, listener) {
        this.forEach(element => events.on(element,
                                            event,
                                            listener));
        return this;
    };

    object.off = function collectionEventOff(event, listener) {
        this.forEach(element => events.off(element,
                                            event,
                                            listener));
        return this;
    };

    object.emit = function collectionEventEmit(event, ...args) {
        this.forEach(element => events.emit(element,
                                                event,
                                                ...args));
        return this;
    };

    return object;
}
