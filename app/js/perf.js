(function(window) {
  "use strict";

  // check if the browser provides the appropriate APIs

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

  function isResourceObject(resource) {
    return resource instanceof PerformanceResourceTiming;
  }

  function isTimingObject(timing) {
    return timing instanceof PerformanceTiming;
  }

  // Citing - https://github.com/addyosmani/timing.js
  function calcFirstPaintTime(window) {
    var firstPaint = 0;
    var firstPaintTime;
    var performance = window.performance;
    var chrome = window.chrome;

    // Chrome
    if (chrome && chrome.loadTimes) {
      // Convert to ms
      firstPaint = chrome.loadTimes().firstPaintTime * 1000;
      firstPaintTime = firstPaint - (chrome.loadTimes().startLoadTime * 1000);
    }
    // IE
    else if (typeof performance.timing.msFirstPaint === "number") {
      firstPaint = performance.timing.msFirstPaint;
      firstPaintTime = firstPaint - performance.timing.navigationStart;
    }

    return firstPaintTime;
  }

  function calcTimingMetrics(timing) {

    if (!isTimingObject(timing)) {
      throw new Error("calcTimingMetrics(): arg bust be a PerformanceTiming object");
    }

    // Citing metrics from Addy Osmani and Perfbar
    return Object.freeze({
      // Total time from start to load
      loadTime: timing.loadEventEnd - timing.navigationStart,
      // Time spent constructing the DOM tree
      domReadyTime: timing.domComplete - timing.domInteractive,
      // Time consumed prepaing the new page
      readyStart: timing.fetchStart - timing.navigationStart,
      // Time spent during redirection
      redirectTime: timing.redirectEnd - timing.redirectStart,
      // AppCache
      appcacheTime: timing.domainLookupStart - timing.fetchStart,
      // Time spent unloading documents
      unloadEventTime: timing.unloadEventEnd - timing.unloadEventStart,
      // DNS query time
      lookupDomainTime: timing.domainLookupEnd - timing.domainLookupStart,
      // TCP connection time
      connectTime: timing.connectEnd - timing.connectStart,
      // Time spent during the request
      requestTime: timing.responseEnd - timing.requestStart,
      // Request to completion of the DOM loading
      initDomTreeTime: timing.domInteractive - timing.responseEnd,
      // Load event time
      loadEventTime: timing.loadEventEnd - timing.loadEventStart,
      // Time it takes to get the first byte from the server
      latency: timing.responseStart - timing.connectStart,
      // Time it takes to get the full response from the server
      backend: timing.responseEnd - timing.navigationStart,
      // Time it takes for the front end to load
      frontend: timing.loadEventStart - timing.responseEnd,
      // Time from DOM loading to the point where it can be used
      domContentLoaded: timing.domContentLoadedEventStart - timing.domInteractive,
      // Time it takes to process the page
      processDuration: timing.loadEventStart - timing.domLoading,
      // Time it takes to paint the first frame
      firstPaintTime: calcFirstPaintTime(window)
    });

  }

  function calcResourceMetrics(resource) {

    if (!isResourceObject(resource)) {
      throw new Error("calcResourceMetrics(): arg bust be a PerformanceResourceTiming object");
    }

    return Object.freeze({
      dns: resource.domainLookupEnd - resource.domainLookupStart,
      tcp: resource.connectEnd - resource.connectStart,
      timeToFirstByte: resource.responseStart - resource.startTime,
      transfer: resource.responseEnd - resource.responseStart,
      total: resource.responseEnd - resource.startTime
    });
  }

  function perf(params) {
    var performance = params.performance;
    var userAgent = params.userAgent;
    var pageUrl = params.pageUrl;
    var listeners = {};
    var resourceCache = {};
    var timing = {};
    var timingMetrics = {};
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
      if (!isResourceObject(resource)) {
        throw new Error("perf.push(): arg bust be a PerformanceResourceTiming object");
      }

      // set the userAgent string
      resource.userAgent = userAgent;

      // calculate metrics
      resource._metrics = calcResourceMetrics(resource);

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
    var interceptXhr = function interceptXhr(callback) {
      var send = XMLHttpRequest.prototype.send;
      XMLHttpRequest.prototype.send = function() {
        var onload = this.onload;
        this.onload = function() {
          if(onload) {
            onload();
          }

          // fire off callback
          callback.call(this);
        };
        send.apply(this, arguments);
      };
    };

    // grab the initially loaded resources
    // these are usually js, css, and image files
    // record and calculate timing metrics of page load
    var init = function() {
      var getEntries = true;
      // Navigation Timing API check - IE9+
      if(!params.performance) {
        throw new Error("perf: Your browser does not support the Navigation Timing API.");
      }

      //Resource Timing API check - IE10+ (No Safari)
      if(!params.performance.getEntries) {
        console.warn("perf: Your browser does not support the Resource Timing API.");
        getEntries = false;
      }

      timing = performance.timing;
      timing._metrics = calcTimingMetrics(timing);

      if(getEntries) {

        // push entries that are added on load
        performance.getEntries().forEach(push);

        interceptXhr(function() {

          // get the entries on the next cycle
          setTimeout(function() {
            reconcile(performance.getEntries());
          });

        });

      }

    };
    init();

    return Object.freeze({
      on: on,
      push: push,
      userAgent: userAgent,
      timing: timing
    });

  }

  window.Perf = perf;

}(window));
