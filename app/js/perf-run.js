$(function() {

  var perf = window.Perf({
    performance: window.performance,
    userAgent: window.navigator.userAgent,
    pageUrl: window.location.href
  });

  //var ref = new Firebase('https://webapi.firebaseio.com/perf');

  perf.on('entry', function(resource) {
    //resourcesRef.push(resource);
    console.log('push resource', resource);
  });

  console.log(perf);

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



  // var interval = setInterval(function() {
  //   $.get('/todos', function(data) {
  //
  //   });
  // }, 3000);

});