var sprintly = require('sprintly-data');

// this is probably bad but whatever
var clients = {};

function createClient(email, apiKey) {
  var client = clients[apiKey];

  if (client && client instanceof sprintly.Client) {
    return client;
  } else {
    client = clients[apiKey] = sprintly.createClient(email, apiKey);
    return client;
  }
}

exports.flushCache = function() {
  // eh ?
  clients = {};
};

exports.fetchProducts = function(creds) {
  var client = createClient(creds.email, creds.apiKey);
  return client.products.fetch();
};

exports.fetchProduct = function(creds, id) {
  var client = createClient(creds.email, creds.apiKey);
  var product = client.products.add({ id: id });
  return product.fetch();
};

exports.authenticate = function(email, apiKey) {
  var client = createClient(email, apiKey);
  return client.user.fetch();
};
