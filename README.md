# perf.js

Listen for Resource Timing API events.

*Currently supports resources that are created on load and XHR requests.*

### Basic usage

```javascript
var perf = window.Perf({
  performance: window.performance
  userAgent: window.navigator.userAgent,
  pageUrl: window.location.href
});

// raises an event for the individual resource as they happen
// currently works for initial resources on page load and XHR calls
perf.on('entry', function(resource) {
   console.log(resource);
});
```

### Listen for XHR requests

```javascript
perf.on('xmlhttprequest', function(resource) {
  // this will fire off for every XHR call (up to 150 entries in the Resource Timing API)
  console.log(resource); 
});
```
