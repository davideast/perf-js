$(function() {

  var perf = window.perf(window.performance, window.navigator.userAgent);
  var ref = new Firebase('https://webapi.firebaseio.com/perf');
  window.requests = [];

  var sessionRef = ref.push({
    userAgent: perf.userAgent
  });

  perf.on('entry', function(resource) {
    sessionRef.push(resource);
    console.log('push resource', resource);
  });

  perf.item = 'modified';

  // var interval = setInterval(function() {
  //   $.get('/todos', function(data) {
  //     console.log('got');
  //   });
  // }, 3000);

});