(function(performance, location) {

  // return if not performance doesn't exist
  // this is obviously not ideal
  if(!performance) {
    console.error('Your browser does not support the Resource Timing API.');
    return;
  }

  // create immutable listener object
  function listener(params) {
    return Object.freeze({
      name: params.name,
      event: params.event
    });
  }

  function findWhere(collection, iterator) {
    var found = [];
    Object.keys(collection).forEach(function(key) {
      var item = collection[key];
      if(iterator(item)) {
        found.push(item);
      }
    });
    return found;
  }

  function size(collection) {
    var length = 0;
    Object.keys(collection).forEach(function(key) {
      length = length + 1;
    });
    return length;
  }

  function toArray(object) {
    var array = [];
    Object.keys(object).forEach(function(key) {
      var item = object[key];
      array.push(item);
    });
    return array;
  }

  function diff(original, b) {
    return original.filter(function(i) {return b.indexOf(i) < 0;});
  }

  function perf(performance, userAgent) {

    var listeners = {};
    var resourceCache = {};
    var uid = 0;

    // increment unique id
    var _nextUid = function() {
	     return uid = uid + 1;
	  };

    // intercept XMLHttpRequest.prototype.send
    (function() {
      var send = XMLHttpRequest.prototype.send;
      XMLHttpRequest.prototype.send = function() {
        var onload = this.onload;
        this.onload = function() {
          if(onload) {
            onload();
          }

          // get the entries on the next cycle
          setTimeout(function() {
            reconcile(performance.getEntries());
          });

        }
        send.call(this);
      };
    }());

    var on = function on(initiatorType, callback) {

      // register listener
      listeners[initiatorType] = listener({
        name: initiatorType,
        event: callback
      });

      // pull from cache
      Object.keys(resourceCache).forEach(function(key) {
        var resource = resourceCache[key];
        push(resource);
      });

    };

    // Validate the event listener exists and raise
    // by initiatorType and global listener if exists.
    var _raiseEvent = function _raiseEvent(resource) {
      var eventListener = listeners[resource.initiatorType];
      var entryListener = listeners.entry;
      if(eventListener) {
        eventListener.event(resource);
      }
      if(entryListener) {
        entryListener.event(resource);
      }
    };

    var reconcile = function reconcile(entries) {
      var cacheArray = toArray(resourceCache);
      var difference = diff(entries, cacheArray);
      // add the items from performance.getEntries() that
      // are not in the resourceCache
      difference.forEach(function(entry) {
        push(entry);
      });
    };

    // Add PerformanceResourceTiming to local cache and raise appropriate events
    var push = function push(resource) {

      // only PerformanceResourceTiming objects can be pushed
      if (resource instanceof PerformanceResourceTiming === false) {
        throw new Error('The resource parameter needs to be a PerformanceResourceTiming object');
      }

      // set the userAgent string
      resource.userAgent = userAgent;

      // raise the proper events
      _raiseEvent(resource);

      // add to local cache
      resourceCache[_nextUid()] = resource;

    };

    // grab the initially loaded resources
    // these are usually js, css, and image files
    var init = function() {
      performance.getEntries().forEach(push);
    };
    init();

    return Object.freeze({
      on: on,
      push: push,
      userAgent: userAgent
    });

  };

  window.perf = perf;

}(window.performance, window.location));