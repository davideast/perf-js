$(function() {

  var perf = window.perf(window.performance, window.navigator.userAgent);
  var ref = new Firebase('https://webapi.firebaseio.com/perf');

  var fireperf = function fireperf(perf, ref) {
    // push the current session
    var sessionRef = ref.push({
      userAgent: perf.userAgent
    });
    
    var resourcesRef = sessionRef.child('resources');

    perf.on('entry', function(resource) {
      resourcesRef.push(resource);
      console.log('push resource', resource);
    });

  };

  //fireperf(perf, ref);



  // var interval = setInterval(function() {
  //   $.get('/todos', function(data) {
  //     console.log('got');
  //   });
  // }, 3000);

});