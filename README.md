Sync Time Demo
==============

Library for time synchronization on the client.

SyncTime requires jQuery 1.5.

SyncTime.sync() makes a number of requests to the server. It passes the client timestamp in milliseconds in UTC time.

``` GET /synctime?t=1475568396666 ```

The server sends response in JSON format with time offset and original timestamp.

``` {"offset":6,"origtime":1475568396666} ```

``` var now = SyncTime.newDate(); ```
 
 is similar to
 
``` var now = new Date(); ``` 

``` var now = SyncTime.getTime(); ```

is similar to

``` var now = new Date().getTime(); ```
