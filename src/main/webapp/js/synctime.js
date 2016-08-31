(function() {

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
            document.cookie = key + '=' + value + '; expires=' + date.toGMTString();
        }
    };

    var defaults = {
        now: function() { return (new Date()).getTime(); },
        ajax: function() { return $.ajax.apply(this, arguments); },
        url: 'synctime',
        method: 'GET',
        minRequestsCount: 5,
        resyncTime: 10,
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
        _options = $.extend({}, defaults, options || {});
        _offsets = [];
    };

    SyncTime.newDate = function() {
        var date = new Date();
        date.setTime(SyncTime.now());
        return date;
    };

    SyncTime.getTime = function() {
        return SyncTime.now();
    };

    SyncTime.now = function() {
        var data = _getJsonStorageData();
        return _now() + (data && data.offset ? data.offset : 0);
    };

    SyncTime.sync = function(callback) {
        var now = _now();
        /*var data = _getJsonStorageData();
        var d = now - (data && data.timestamp ? data.timestamp : 0);
        if (d < _options.resyncTime * 60 * 1000) {
            return;
        }*/

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
                SyncTime.sync();
                return;
            }

            if (_offsets.length > _options.maxOffsetsCount) {
                _offsets.shift();
            }

            var average = 0;
            if (_offsets.length > 1) {
                console.log(_offsets);
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

    window.SyncTime = SyncTime;
}());