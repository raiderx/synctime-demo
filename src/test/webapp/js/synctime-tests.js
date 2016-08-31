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

    QUnit.test('newDate', function(assert) {

        var date = new Date(1995, 11, 17, 3, 24, 0);
        var options = {
            now: function() { return date.getTime(); },
            storage: new FakeStorage()
        };

        SyncTime.init(options);

        assert.deepEqual(SyncTime.newDate(), date);
    });

    QUnit.test('getTime', function(assert) {

        var ts = new Date(1995, 11, 17, 3, 24, 0).getTime();
        var options = {
            now: function() { return ts; },
            storage: new FakeStorage()
        };

        SyncTime.init(options);

        assert.equal(SyncTime.getTime(), ts);
    });

    QUnit.test('now', function(assert) {

        var ts = new Date(1995, 11, 17, 3, 24, 0).getTime();
        var options = {
            now: function() { return ts; },
            storage: new FakeStorage()
        };

        SyncTime.init(options);

        assert.equal(SyncTime.now(), ts);
    });

    QUnit.test('sync', function(assert) {

        var dfd = $.Deferred();
        var ts = new Date(1995, 11, 17, 3, 24, 0).getTime();
        var options = {
            ajax: function() {
                return dfd.promise();
            },
            now: function() { return ts; },
            storage: new FakeStorage(),
            minRequestsCount: 1
        };

        SyncTime.init(options);

        assert.equal(SyncTime.now(), ts);

        SyncTime.sync();

        dfd.resolve({ offset: 100, origtime: ts });

        assert.equal(SyncTime.now(), ts + 100);
    });
})();
