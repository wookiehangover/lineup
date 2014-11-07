exports.secret = process.env.SECRET || 'shhhh!';

exports.assets = {
  development: {
    css: ['css/main.css']
  },
  production: {
    css: ['css/main.min.css']
  }
};
