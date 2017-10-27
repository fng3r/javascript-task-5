'use strict';

const { EventEmitter } = require('./EventEmitter');

/**
 * Сделано задание на звездочку
 * Реализованы методы several и through
 */
getEmitter.isStar = true;
module.exports = getEmitter;

/**
 * Возвращает новый emitter
 * @returns {EventEmitter}
 */
function getEmitter() {
    return new EventEmitter();
}
