var $ = require('jquery');
var React = require('react');
var Dashboard = require('./components/dashboard');
var Quicksort = require('./components/quicksort');
var sprintly = require('sprintly-data');

$(function() {
  var client = sprintly.createClient(sprintly_data.user.email, sprintly_data.user.apiKey);
  client.user.set(sprintly_data.user);
  var product = client.products.add(sprintly_data.product);
  var backlog = product.getItemsByStatus('backlog');
  var socket = window.socket = io();

  window.lineup = {
    client: client,
    product: product,
    backlog: React.render(
      <Dashboard backlog={backlog} socket={socket} roomId={sprintly_data.room} />,
      document.getElementById('story')
    ),
    quicksort: React.render(
      <Quicksort backlog={backlog} />,
      document.getElementById('quicksort')
    )
  };

  // socket.on('msg', function(msg) {
  //   console.log(msg);
  // });


});
