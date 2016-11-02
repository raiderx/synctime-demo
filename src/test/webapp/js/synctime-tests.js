(function() {

    function FakeStorage() {

        var _value = null;

        this.getItem = function () {
            return _value;
        };

        this.setItem = function (k, v) {
            _value = v;
        };
    }

    QUnit.test('SyncTime.init()', function(assert) {

        assert.throws(function() {
            var options = { now: null };
            SyncTime.init(options);
        }, 'Option \'now\' must be a function that returns a number');

        assert.throws(function() {
            var options = { now: function() { return null; } };
            SyncTime.init(options);
        }, 'Option \'now\' must return a number');

        SyncTime.init();

        SyncTime.init({});
    });

    QUnit.test('SyncTime.newDate()', function(assert) {

        var date = new Date(1995, 11, 17, 3, 24, 0);
        var options = {
            now: function() { return date.getTime(); }
        };

        SyncTime.init(options);

        assert.deepEqual(SyncTime.newDate(), date, 'Actual date corresponds to expected');
    });

    QUnit.test('SyncTime.getTime()', function(assert) {

        var ts = new Date(1995, 11, 17, 3, 24, 0).getTime();
        var options = {
            now: function() { return ts; }
        };

        SyncTime.init(options);

        assert.equal(SyncTime.getTime(), ts, 'Actual number of milliseconds corresponds to expected');
    });

    QUnit.test('SyncTime.now()', function(assert) {

        var ts = new Date(1995, 11, 17, 3, 24, 0).getTime();
        var options = {
            now: function() { return ts; },
            storage: new FakeStorage()
        };

        SyncTime.init(options);

        assert.equal(SyncTime.now(), ts, 'Actual number of milliseconds corresponds to expected');
    });

    QUnit.test('SyncTime.sync()', function(assert) {

        var dfd = $.Deferred();
        var ts = 1000000;
        var storage = new FakeStorage();
        var options = {
            ajax: function() {
                return dfd;
            },
            now: function() { return ts; },
            storage: storage,
            minRequestsCount: 1
        };

        SyncTime.init(options);

        assert.equal(SyncTime.now(), ts, 'Actual number of milliseconds corresponds to expected');

        SyncTime.sync(function(average) {
            assert.equal(average, 10, 'Average offset is correct');
        });

        dfd.resolve({ offset: 10, origtime: ts });

        assert.equal(storage.getItem(), '{"offset":10,"timestamp":1000000}', 'Storage item is correct');

        assert.equal(SyncTime.now(), ts + 10, 'Actual number of milliseconds corresponds to expected');
    });

    QUnit.test('SyncTime.sync() when offset is negative', function(assert) {

        var dfd = $.Deferred();
        var ts = 1000000;
        var storage = new FakeStorage();
        var options = {
            ajax: function() {
                return dfd;
            },
            now: function() { return ts; },
            storage: storage,
            minRequestsCount: 1
        };

        SyncTime.init(options);

        assert.equal(SyncTime.now(), ts, 'Actual number of milliseconds corresponds to expected');

        SyncTime.sync(function(average) {
            assert.equal(average, -10, 'Average offset is correct');
        });

        dfd.resolve({ offset: -10, origtime: ts });

        assert.equal(storage.getItem(), '{"offset":-10,"timestamp":1000000}', 'Storage item is correct');

        assert.equal(SyncTime.now(), ts - 10, 'Actual number of milliseconds corresponds to expected');
    });

})();
