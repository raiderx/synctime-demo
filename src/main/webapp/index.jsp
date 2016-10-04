<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="utf-8">
    <title>Sync Time Demo</title>
</head>
<body>

<h2>Sync Time Demo</h2>

<p>Time: <span id="time"></span></p>
<p>Offset: <span id="offset"></span></p>

<button id="sync">Sync</button>

<script src="js/jquery-1.12.4.min.js"></script>
<script src="js/synctime.js"></script>
<script type="text/javascript">
    $(function() {
        var callback = function(offset) {
            $('#time').text(SyncTime.newDate());
            $('#offset').text(offset);
        };

        SyncTime.init({ resyncInterval: 30 });
        SyncTime.scheduleSync(callback);

        $('#sync').on('click', function() {
            SyncTime.sync(callback);
        });
    });
</script>

</body>
</html>
