var _ = require('lodash');
var config = require('config');
var sprintly = require('../lib/sprintly');

function loginHandler(request, reply) {
  if (request.auth.isAuthenticated) {
    return reply.redirect('/');
  }

  if (request.method === 'get' ) {
    return reply.view('login', {
      title: 'Login | Sprintly Lineup'
    });
  }

  if (request.method === 'post') {
    if (!request.payload.email || !request.payload.apiKey) {
      return reply.view('login', {
        title: 'Login Error',
        errors: 'Missing email or apiKey'
      });
    }

    sprintly.authenticate(request.payload.email, request.payload.apiKey)
      .then(function(account) {
        account.set('apiKey', request.payload.apiKey);
        request.auth.session.set(account.toJSON());
        reply.redirect('/');
      })
      .catch(function(err) {
        reply.view('login', {
          title: 'Login Error',
          error: err.message
        });
      });
  }
}

exports.handlers = {
  login: {
    method: ['GET', 'POST'],
    path: '/login',
    config: {
      handler: loginHandler,
      auth: {
        mode: 'try',
        strategy: 'session'
      },
      plugins: {
        'hapi-auth-cookie': {
          redirectTo: false
        }
      }
    }
  },
  logout: {
    method: ['GET'],
    path: '/logout',
    handler: function(request, reply) {
      request.auth.session.clear();
      reply.redirect('/');
    },
    config: {
      auth: 'session'
    }
  }
};

exports.strategy = {
  password: config.secret,
  redirectTo: '/login',
  isSecure: process.env.NODE_ENV == 'production',
  cookie: 'sid',
  ttl: 3154e7, // 1 year
  clearInvalid: true
};

exports.register = function(plugin, options, done) {
  plugin.register(require('hapi-auth-cookie'), function(err) {
    if (err) {
      throw err;
    }

    plugin.auth.strategy('session', 'cookie', exports.strategy);
    plugin.route(_.values(exports.handlers));
    done();
  });
};

exports.register.attributes = {
  name: 'sprintly-session',
  version: '1.0.0'
};
