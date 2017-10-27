'use strict';


/**
 * @description Simple event emitter implementation 
 */
class EventEmitter {
    constructor(namespaceDelimeter = '.') {
        this.events = {};
        this.namespaceDelimeter = namespaceDelimeter;
    }

    /**
     * Подписаться на событие
     * @param {String} event
     * @param {Object} context
     * @param {Function} handler
     * @param {Object} emitParams
     * @returns {this}
     */
    on(event, context, handler) {
        return this._on(event, context, handler);
    }

    /**
     * Отписаться от события
     * @param {String} event
     * @param {Object} context
     * @returns {this}
     */
    off(event, context) {
        const removableEvents = Object.keys(this.events).filter(eventName =>
            eventName === event || eventName.startsWith(event + this.namespaceDelimeter));

        for (const eventName of removableEvents) {
            this.events[eventName] = this.events[eventName]
                .filter(subscription => subscription.context !== context);
        }

        return this;
    }

    /**
     * Уведомить о событии
     * @param {String} event
     * @returns {this}
     */
    emit(event) {
        while (event) {
            const subscriptions = this.events[event];
            if (subscriptions) {
                this._notifySubscribers(subscriptions);
            }

            event = event.substring(0, event.lastIndexOf(this.namespaceDelimeter));
        }

        return this;
    }

    /**
     * Подписаться на событие с ограничением по количеству полученных уведомлений
     * @star
     * @param {String} event
     * @param {Object} context
     * @param {Function} handler
     * @param {Number} times – сколько раз получить уведомление
     * @returns {this}
     */
    several(event, context, handler, times) {
        if (!times || times <= 0) {
            times = Infinity;
        }

        return this._on(event, context, handler, { maxCount: times });
    }

    /**
     * Подписаться на событие с ограничением по частоте получения уведомлений
     * @star
     * @param {String} event
     * @param {Object} context
     * @param {Function} handler
     * @param {Number} frequency – как часто уведомлять
     * @returns {this}
     */
    through(event, context, handler, frequency) {
        if (!frequency || frequency <= 0) {
            frequency = 1;
        }

        return this._on(event, context, handler, { frequency });
    }

    _on(event, context, handler, emitParams = {}) {
        if (!this.events[event]) {
            this.events[event] = [];
        }

        const subscription = {
            handler,
            context,
            count: 0,
            maxCount: emitParams.maxCount || Infinity,
            frequency: emitParams.frequency || 1
        };

        this.events[event].push(subscription);

        return this;
    }

    _notifySubscribers(subscriptions) {
        for (const subscription of subscriptions) {
            const { count, maxCount, frequency, handler, context } = subscription;
            if (count < maxCount && count % frequency === 0) {
                handler.call(context);
            }
            subscription.count++;
        }
    }
}

exports.EventEmitter = EventEmitter;
