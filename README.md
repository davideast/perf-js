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

// loads the individual resource as they happen
perf.on('entry', function(resource) {
   console.log(resource);
});
```

### Listen for XHR requests

```javascript
perf.on('xmlhttprequest', function(resource) {
  // this will fire off for every XHR call made
  console.log(resource); 
});
```
