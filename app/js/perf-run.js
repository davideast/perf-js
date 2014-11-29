$(function() {

  var perf = window.Perf({
    performance: window.performance,
    userAgent: window.navigator.userAgent,
    pageUrl: window.location.href
  });

  var ref = new Firebase('https://perf.firebaseio.com/');

  // users


  // sites
  //   sessions
  //     - metrics
  //     - resources
  //     - stats



  var sessionRef = ref.push({
    pageUrl: perf.pageUrl,
    userAgent: perf.userAgent,
    timing: perf.timing
  });

  perf.on('xmlhttprequest', function(resource) {
    sessionRef.child('resources').push(resource);
  });

  // var fireperf = function fireperf(perf, ref) {
  //   // push the current session
  //   var sessionRef = ref.push({
  //     userAgent: perf.userAgent
  //   });
  //
  //   var resourcesRef = sessionRef.child('resources');
  //
  //   perf.on('entry', function(resource) {
  //     resourcesRef.push(resource);
  //     console.log('push resource', resource);
  //   });
  //
  // };

  //fireperf(perf, ref);

  var interval = setInterval(function() {
    $.get('https://localhost:4577/todos', function(data) {
      console.log(data);
    });
  }, 3000);

});