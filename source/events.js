let globalEventCache = {
    map: new WeakMap(),
    getListeners(params = {}) {
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
    callListeners(params = {}) {
        let {args, element} = params;
        this.getListeners(params)
            .forEach(listener => listener.apply(element, args));
    },
    addListener(params = {}) {
        let {listener} = params;
        if (typeof listener === 'function') {
            this.getListeners(params).push(listener);
        }
    },
    removeListener(params = {}) {
        let {listener} = params,
            listeners = this.getListeners(params);

        let indexOfListener = listeners.indexOf(listener);
        if (indexOfListener !== -1) {
            listeners.splice(indexOfListener, 1);
        }
    },
    removeListeners(params = {}) {
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
    clear() {
        this.map = new WeakMap();
    }
};

export let events = {
    emit(element, event, ...args) {
        globalEventCache.callListeners({element,
                                            event,
                                            args});
    },
    on(element, event, listener) {
        globalEventCache.addListener({element,
                                        event,
                                        listener});

    },
    off(element, event, listener) {
        globalEventCache.removeListeners({element,
                                            event,
                                            listener});
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
