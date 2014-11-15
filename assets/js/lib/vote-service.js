var _ = require('lodash');

var POINT_SCALE = exports.POINT_SCALE = {
  '~': 0,
  'S': 1,
  'M': 3,
  'L': 5,
  'XL': 8
};

var INVERSE_POINT_SCALE = exports.INVERSE_POINT_SCALE = _.zipObject(
  _.values(POINT_SCALE), _.keys(POINT_SCALE)
);

exports.calculate = function(votes) {
  var scores = _.values(votes);
  var total = _.reduce(_.map(scores, function(score) {
    return POINT_SCALE[score];
  }), function(sum, val) {
    return sum + val;
  });

  var avgScore = Math.round(total / scores.length);
  var adjScore = avgScore;

  switch(avgScore) {
    case 0:
    case 1:
      break;
    case 2:
      adjScore = 3;
      break;
    case 3:
      break;
    case 4:
    case 5:
      adjScore = 5;
      break;
    case 6:
    case 7:
    case 8:
      adjScore = 8;
      break;
  }

  // console.log(avgScore, adjScore, INVERSE_POINT_SCALE[adjScore]);
  return INVERSE_POINT_SCALE[adjScore];
};


