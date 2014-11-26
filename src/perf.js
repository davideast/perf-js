(function(window, performance) {
  "use strict";

  // return if not performance doesn't exist
  // this is obviously not ideal
  if(!performance) {
    throw new Error("perf: Your browser does not support the Resource Timing API.");
  }

  // create immutable listener object
  function listener(params) {
    return Object.freeze({
      name: params.name,
      event: params.event
    });
  }

  // find all items in a collection that match a comparison's criteria
  function findWhere(collection, compare) {
    var found = [];
    Object.keys(collection).forEach(function(key) {
      var item = collection[key];
      if(compare(item)) {
        found.push(item);
      }
    });
    return found;
  }

  // find the size of a collection (either array or object)
  function size(collection) {
    var length = 0;
    Object.keys(collection).forEach(function(key) {
      length = length + 1;
    });
    return length;
  }

  // Map an object's properties into an array
  function objToArray(object) {
    return Object.keys(object).map(function(key) {
      return object[key];
    });
  }

  // return the difference between two arrays
  function diff(original, b) {
    return original.filter(function(i) {return b.indexOf(i) < 0;});
  }

  function perf(performance, userAgent) {

    var listeners = {};
    var resourceCache = {};
    var uid = 0;

    // increment unique id
    var nextUid = function() {
      var newUid = uid + 1;
      return newUid;
    };

    // Validate the event listener exists and raise
    // by initiatorType and global listener if exists.
    var raiseEvent = function raiseEvent(resource) {
      var eventListener = listeners[resource.initiatorType];
      var entryListener = listeners.entry;
      if(eventListener) {
        eventListener.event(resource);
      }
      if(entryListener) {
        entryListener.event(resource);
      }
    };

    // Add PerformanceResourceTiming to local cache and raise appropriate events
    var push = function push(resource) {

      // only PerformanceResourceTiming objects can be pushed
      if (resource instanceof PerformanceResourceTiming === false) {
        throw new Error("perf.push(): First arg bust be a PerformanceResourceTiming object");
      }

      // set the userAgent string
      resource.userAgent = userAgent;

      // raise the proper events
      raiseEvent(resource);

      // add to local cache
      resourceCache[nextUid()] = resource;

    };

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

    var reconcile = function reconcile(entries) {
      var cacheArray = objToArray(resourceCache);
      var difference = diff(entries, cacheArray);
      // add the items from performance.getEntries() that
      // are not in the resourceCache
      difference.forEach(function(entry) {
        push(entry);
      });
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

        };
        send.call(this);
      };
    }());

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

  }

  window.perf = perf;

}(window, window.performance));
