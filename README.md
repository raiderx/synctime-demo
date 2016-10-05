Sync Time Demo
==============

Library for time synchronization on the client.

## Requirements

SyncTime requires jQuery 1.5.

## Initialization

Use `init()` method to initialize synchronisation:

```javascript
SyncTime.init();
```

Also you can initialize synchronisation with different parameters: 

```javascript
SyncTime.init({ url: '/synctime', method: 'POST' });
```

Synchronisation can be initialized with the following parameters:

* now - custom function that returns current timestamp in milliseconds,
* ajax - custom function that makes AJAX request, by default it is jQuery `$.ajax`,
* url - request url that returns server response, by default it is `synctime`,
* method - request method, by default it is `GET`,
* minRequestCount - minimum number of requests sufficient for time synchronisation, by default it is 5,
* resyncInterval - interval in seconds between requests to the server, by default it is 0 i.e. no requests,
* maxOffsetsCount - maximum number of offsets between client and server time, by default it is 20,
* storage - object that stores synchronisation data, by default such data is stores in cookie,
* dataKey - name of the key for synchronisation data, by default it is `SyncTimeData`.

## Using

SyncTime.sync() makes a number of requests to the server. It passes the client timestamp in milliseconds in UTC time.

``` GET /synctime?t=1475568396666 ```

The server sends response in JSON format with time offset and original timestamp.

``` {"offset":6,"origtime":1475568396666} ```

In order to get a JavaScript `Date` instance you can use:

```javascript
var now = SyncTime.newDate();
```
 
 It is similar to:
 
```javascript
var now = new Date();
```
 
 In order to get the number of milliseconds elapsed since 1 January 1970 00:00:00 UTC you can use:

```javascript
var now = SyncTime.getTime();
```

It is similar to:

```javascript
var now = new Date().getTime();
```
