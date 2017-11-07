'use strict';

/**
 * @description Simple event emitter implementation 
 */
class EventEmitter {
    constructor(namespaceDelimeter = '.') {
        this._events = {};
        this._namespaceDelimeter = namespaceDelimeter;
    }

    /**
     * Подписаться на событие
     * @param {String} event - имя события, на которое происходит подписка
     * @param {Object} context - контекст, с которым будет вызван handler
     * @param {Function} handler - обработчик, который будет вызван в момент совершения события
     * @returns {this}
     */
    on(event, context, handler) {
        return this._on(event, context, handler);
    }

    /**
     * Отписаться от события
     * @param {String} event - имя события, от которого хотим отписаться
     * @param {Object} context - контекст, для которого совершаем отписку
     * @returns {this}
     */
    off(event, context) {
        const removableEventNames = Object
            .keys(this._events)
            .filter(eventName =>
                eventName === event || eventName.startsWith(event + this._namespaceDelimeter));

        for (const eventName of removableEventNames) {
            this._events[eventName] = this._events[eventName]
                .filter(subscription => subscription.context !== context);
        }

        return this;
    }

    /**
     * Уведомить о событии
     * @param {String} event - имя совершаемого события
     * @returns {this}
     */
    emit(event) {
        while (event) {
            const subscriptions = this._events[event];
            if (subscriptions) {
                this._notifySubscribers(subscriptions);
            }

            const parentEvent = event.substring(0, event.lastIndexOf(this._namespaceDelimeter));
            event = parentEvent;
        }

        return this;
    }

    /**
     * Подписаться на событие с ограничением по количеству полученных уведомлений
     * @star
     * @param {String} event - имя события, на которое происходит подписка
     * @param {Object} context - контекст, с которым будет вызван handler
     * @param {Function} handler - обработчик, который будет вызван в момент совершения события
     * @param {Number} maxCount – сколько раз получить уведомление
     * @returns {this}
     */
    several(event, context, handler, maxCount) {
        if (!maxCount || maxCount <= 0) {
            maxCount = Infinity;
        }

        return this._on(event, context, handler, { maxCount });
    }

    /**
     * Подписаться на событие с ограничением по частоте получения уведомлений
     * @star
     * @param {String} event - имя события, на которое происходит подписка
     * @param {Object} context - контекст, с которым будет вызван handler
     * @param {Function} handler - обработчик, который будет вызван в момент совершения события
     * @param {Number} frequency – как часто стоит уведомлять
     * @returns {this}
     */
    through(event, context, handler, frequency) {
        if (!frequency || frequency <= 0) {
            frequency = 1;
        }

        return this._on(event, context, handler, { frequency });
    }

    _on(event, context, handler, emitParams = {}) {
        if (!this._events[event]) {
            this._events[event] = [];
        }

        const subscription = {
            handler,
            context,
            count: 0,
            maxCount: emitParams.maxCount || Infinity,
            frequency: emitParams.frequency || 1
        };

        this._events[event].push(subscription);

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

module.exports = EventEmitter;
