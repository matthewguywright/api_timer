if(window.jQuery) {
    /**
     * ApiTimer
     * @module ApiTimer
     * @version 1.0.0
     * @author Matthew Wright
     * @description ApiTimer is a general use interval and timeout timer that includes cookie, ajax call, and debug mode.
     * @requires jQuery 1.5+
     * @returns {object}
     */
    var ApiTimer = (function ($) {
        'use strict';

        var tm = {};

        var settings = {
            cookieName: 'API Timer',
            maxTimerMinutes: 15,
            intervalMinutes: 1,
            debug: false,
            onStart: null,
            onComplete: null,
            onStop: null,
            onIStop: null,
            onIComplete: null,
            onIStart: null
        };

        /**
         * This function is the constructor for ApiTimer
         * @function init
         * @static
         * @param {object} options - Constructor options for API Timer
         * @param {any} options.timer - Timeout
         * @param {any} options.interval - Interval
         * @param {string} options.cookieName - Cookie name
         * @param {int} options.maxTimerMinutes - Timer minutes
         * @param {int} options.intervalMinutes - Interval minutes
         * @param {bool} options.debug - Shows logging
         * @param {function} options.onStart - Function to trigger when timer begins
         * @param {function} options.onComplete - Function to trigger when the timer completes
         * @param {function} options.onStop - Function to trigger when the timer stops
         * @param {function} options.onIStart - Function to trigger when the interval starts
         * @param {function} options.onIComplete - Function to trigger when the interval completes a cycle
         * @param {function} options.onIStop - Function to trigger when the interval stops
         */
        tm.init = function (options) {
            if (options) {
                $.extend(settings, options);
            }

            tm.timer = null;
            tm.interval = null;
            tm.cookieName = settings.cookieName;
            tm.maxTimerMinutes = settings.maxTimerMinutes;
            tm.intervalMinutes = settings.intervalMinutes;
            tm.debug = settings.debug;
            tm.onStart = settings.onStart;
            tm.onComplete = settings.onComplete;
            tm.onStop = settings.onStop;
            tm.onIStart = settings.onIStart;
            tm.onIComplete = settings.onIComplete;
            tm.onIStop = settings.onIStop;
        };

        var logger = function (message) {
            if (tm.debug) {
                console.log(message);
            }
        };

        var setCookie = function (name, value, days) {
            var expires = '';
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = '; expires=' + date.toUTCString();
            }
            document.cookie = name + '=' + (value || '') + expires + '; path=/';
        };

        var getCookie = function (name) {
            var nameEQ = name + '=';
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1, c.length);
                }
                if (c.indexOf(nameEQ) == 0) {
                    return c.substring(nameEQ.length, c.length);
                }
            }
            return null;
        };

        var timerComplete = function () {
            if (tm.onComplete) {
                return tm.onComplete();
            } else {
                logger('Timer Expired: ' + tm.elapsedTime() + ' minutes have passed.');
            }
        };

        var intervalComplete = function () {
            if (tm.onIComplete) {
                return tm.onIComplete();
            } else {
                logger('Interval Complete');
            }
        };

        /**
         * Sets the callback for the timer complete function
         * @function onTimerComplete
         * @static
         * @param callback
         */
        tm.onTimerComplete = function (callback) {
            tm.onComplete = callback;
        };

        /**
         * Sets the callback for the timer start function
         * @function onTimerStart
         * @static
         * @param callback
         */
        tm.onTimerStart = function (callback) {
            tm.onStart = callback;
        };

        /**
         * Sets the callback for the timer stop function
         * @function onTimerStop
         * @static
         * @param callback
         */
        tm.onTimerStop = function (callback) {
            tm.onStop = callback;
        };

        /**
         * Sets the callback for the interval complete function
         * @function onIntervalComplete
         * @static
         * @param callback
         */
        tm.onIntervalComplete = function (callback) {
            tm.onIComplete = callback;
        };

        /**
         * Sets the callback for the interval start function
         * @function onIntervalStart
         * @static
         * @param callback
         */
        tm.onIntervalStart = function (callback) {
            tm.onIStart = callback;
        };

        /**
         * Sets the callback for the interval stop function
         * @function onIntervalStop
         * @static
         * @param callback
         */
        tm.onIntervalStop = function (callback) {
            tm.onIStop = callback;
        };

        /**
         * Return the minutes that have elapsed between the current DateTime and the stored cookie DateTime
         * @function elapsedTime
         * @static
         * @returns {number} - The minutes that have elapsed
         */
        tm.elapsedTime = function () {
            var startDateCookieValue = getCookie(tm.cookieName);
            if (startDateCookieValue) {
                var endDateTime = new Date();
                var dateTimeDiff = (endDateTime - new Date(startDateCookieValue));
                dateTimeDiff /= 1000;
                dateTimeDiff /= 60;
                // return minutes elapsed
                var minutesElapsed = Math.round(dateTimeDiff);
                logger('Time Elapsed (minutes): ' + minutesElapsed);
                return minutesElapsed;
            } else {
                logger('No cookie was set.');
                return 0;
            }
        };

        /**
         * Makes an ajax call with the specified parameters
         * @function ajaxCall
         * @static
         * @param ajaxOptions - The options that can be passed to override the default ajax call options
         * @param ajaxOptions.url - The api endpoint or desired url
         * @param ajaxOptions.async - Whether to use async or not
         * @param ajaxOptions.dataType - Specifies the return type
         * @param ajaxOptions.type - The http method, i.e. POST, GET, DELETE, PUT
         * @param ajaxOptions.cache - Whether to cache the call or not
         * @returns {Promise<never>|*|{getAllResponseHeaders, abort, setRequestHeader, readyState, getResponseHeader, overrideMimeType, statusCode}}
         */
        tm.ajaxCall = function (ajaxOptions) {
            if (ajaxOptions && ajaxOptions.url) {
                return $.ajax({
                    url: ajaxOptions.url,
                    async: ajaxOptions.async || true,
                    dataType: ajaxOptions.dataType || 'json',
                    type: ajaxOptions.type || 'POST',
                    cache: ajaxOptions.cache || false
                });
            }

            return $.Deferred().reject('An API url is required.');
        };

        /**
         * Stops the timeout timer
         * @static
         * @function stopTimer
         */
        tm.stopTimer = function () {
            if (tm.timer) {
                clearTimeout(tm.timer);
                if (tm.onStop) {
                    return tm.onStop();
                }
                logger('Timer Stopped');
            }
        };

        /**
         * Stops the interval timer
         * @static
         * @function stopInterval
         */
        tm.stopInterval = function () {
            if (tm.interval) {
                clearInterval(tm.interval);
                if (tm.onIStop) {
                    return tm.onIStop();
                }
                logger('Interal Stopped');
            }
        };

        /**
         * Starts and runs the timeout timer
         * @static
         * @function runTimer
         */
        tm.runTimer = function () {
            tm.stopTimer();
            setCookie(tm.cookieName, new Date(), 1);
            tm.timer = setTimeout(timerComplete, tm.maxTimerMinutes * 60 * 1000);
            if (tm.onStart) {
                return tm.onStart();
            }
            logger('Running Timer');
        };

        /**
         * Starts and runs the interval timer
         * @static
         * @function runInterval
         */
        tm.runInterval = function () {
            tm.stopInterval();
            tm.interval = setInterval(intervalComplete, tm.intervalMinutes * 60 * 1000);
            if (tm.onIStart) {
                return tm.onIStart();
            }
            logger('Running Interval');
        };

        return tm;
    })(jQuery);
} else {
    console.warn('jQuery is required for Api Timer. Api Timer was not loaded.');
}
