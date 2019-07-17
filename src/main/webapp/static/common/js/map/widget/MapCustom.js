define([
    "esri/core/Accessor"
], function (accessor) {

    var Custom = accessor.createSubclass({
        debounce: function (func, wait, immediate) {
            var timeout, args, context, timestamp, result;
            return function () {
                context = this;
                args = arguments;
                timestamp = new Date();
                var later = function () {
                    var last = (new Date()) - timestamp;
                    if (last < wait) {
                        timeout = setTimeout(later, wait - last);
                    } else {
                        timeout = null;
                        if (!immediate) result = func.apply(context, args);
                    }
                };
                var callNow = immediate && !timeout;
                if (!timeout) {
                    timeout = setTimeout(later, wait);
                }
                if (callNow) result = func.apply(context, args);
                return result;
            };
        },
        last: function (array) {
            if (array && array.length) {
                return array[array.length - 1];
            }
            return null;
        }
    });
    return Custom;

})