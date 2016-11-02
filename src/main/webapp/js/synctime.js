;(function() {

    var SyncTime = {};

    var cookieStorage = {
        getItem: function(key) {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; ++i) {
                var cookie = cookies[i].split('=');
                if (cookie[0].trim() === key) {
                    return cookie[1];
                }
            }
            return null;
        },
        setItem: function(key, value) {
            var date = new Date();
            date.setTime(date.getTime() + 7 * 24 * 60 * 60 * 1000);
            document.cookie = key + '=' + value + '; expires=' + date.toGMTString() + '; path=/';
        }
    };

    var defaults = {
        now: function() { return (new Date()).getTime(); },
        ajax: function() { return $.ajax.apply(this, arguments); },
        url: 'synctime',
        method: 'GET',
        minRequestsCount: 5,
        resyncInterval: 0,
        maxOffsetsCount: 20,
        storage: cookieStorage,
        dataKey: 'SyncTimeData'
    };

    var _options = defaults;
    var _offsets = [];

    function _now() {
        return _options.now();
    }

    function _error(e) {
        if (_options.error) {
            _options.error(e);
        }
    }

    function _getJsonStorageData() {
        var dataStr = _options.storage.getItem(_options.dataKey);
        var data = { offset: 0, timestamp: 0 };
        try {
            data = dataStr ? JSON.parse(dataStr) : data;
        } catch(e) {
            _error(e);
        }
        return data;
    }

    SyncTime.init = function(options) {
        var opts = $.extend({}, defaults, options || {});

        if (typeof opts.now !== 'function') {
            throw 'Option \'now\' must be a function that returns a number';
        }
        var now = opts.now();
        if (typeof now !== 'number') {
            throw 'Option \'now\' must return a number';
        }

        _options = opts;
        _offsets = [];
    };

    /**
     * Returns a JavaScript {Date} instance that represents a single moment in time.
     *
     * @returns a JavaScript {Date} instance that represents a single moment in time.
     */
    SyncTime.newDate = function() {
        var date = new Date();
        date.setTime(SyncTime.now());
        return date;
    };

    /**
     * Returns the number of milliseconds elapsed since 1 January 1970 00:00:00 UTC.
     *
     * @returns a {Number} representing the milliseconds elapsed since the UNIX epoch.
     */
    SyncTime.getTime = function() {
        return SyncTime.now();
    };

    /**
     * Returns the number of milliseconds elapsed since 1 January 1970 00:00:00 UTC.
     *
     * @returns a {Number} representing the milliseconds elapsed since the UNIX epoch.
     */
    SyncTime.now = function() {
        var data = _getJsonStorageData();
        return _now() + (data && data.offset ? data.offset : 0);
    };

    /**
     * Starts time synchronisation immediately
     *
     * @param callback will be executed after synchronisation, time offset will be passed as parameter
     */
    SyncTime.sync = function(callback) {
        var now = _now();

        _options.ajax({
            url: _options.url,
            method: _options.method,
            data: { t: now },
            dataType: 'JSON'
        }).done(function(response) {
            var ts = _now();
            var delay = (ts - response.origtime) / 2;
            var offset = response.offset - delay;

            _offsets.push(offset);

            if (_offsets.length < _options.minRequestsCount) {
                SyncTime.sync(callback);
                return;
            }

            if (_offsets.length > _options.maxOffsetsCount) {
                _offsets.shift();
            }

            var average = 0;
            if (_offsets.length > 1) {
                for (var i = 0; i < _offsets.length; ++i) {
                    average += _offsets[i];
                }
                average = Math.round(average / _offsets.length);
            } else {
                average = _offsets[0];
            }

            _options.storage.setItem(_options.dataKey, JSON.stringify({ offset: average, timestamp: ts }));

            if (callback && typeof callback === 'function') {
                callback(average);
            }
        });
    };

    /**
     * Starts time synchronisation in background
     *
     * @param callback will be executed after synchronisation, time offset will be passed as parameter
     */
    SyncTime.scheduleSync = function(callback) {
        SyncTime.sync(callback);

        if (_options.resyncInterval > 0) {
            setTimeout(function () {
                try {
                    SyncTime.scheduleSync(callback);
                } catch (e) {
                }

            }, _options.resyncInterval * 1000);
        }
    };

    window.SyncTime = SyncTime;
}());
