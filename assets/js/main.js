var $ = require('jquery');
var React = require('react');
var Backlog = React.createFactory(require('./components/backlog'));
var sprintly = require('sprintly-data');

$(function() {
  var client = sprintly.createClient(sprintly_user.email, sprintly_user.apiKey);
  client.user.set(sprintly_user);
  var product = client.products.add(sprintly_product);

  window.lineup = {
    client: client,
    product: product,
    backlog: React.render(
      Backlog({
        backlog: product.getItemsByStatus('backlog')
      }),
      document.getElementById('score')
    )
  };


});
