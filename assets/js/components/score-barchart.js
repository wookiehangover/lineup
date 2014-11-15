var React = require('react/addons');
var voteService = require('../lib/vote-service');

var ScoreBarchart = React.createClass({

  propTypes: {
    totalMembers: React.PropTypes.number.isRequired,
    calculatedScore: React.PropTypes.string.isRequired
  },

  renderBar: function(label, score) {
    var classList = {
      bar: true
    };

    switch(label) {
      case '~':
        classList['bar-zero'] = true;
        break;
      case 'S':
        classList['bar-small'] = true;
        break;
      case 'M':
        classList['bar-medium'] = true;
        break;
      case 'L':
        classList['bar-large'] = true;
        break;
      case 'XL':
        classList['bar-xlarge'] = true;
        break;
      default:
        break;
    }

    if (voteService.POINT_SCALE[score] >= voteService.POINT_SCALE[label]) {
      classList.active = true;
    }

    return (
      <div className={React.addons.classSet(classList)}></div>
    );
  },

  renderConnectedUsers: function(memberCount) {
    memberCount -= 1;
    var message = [memberCount, (memberCount === 1 ? 'User': 'Users'),'Connected'];
    return (<h3 className="user-status">{message.join(' ')}</h3>);
  },

  render: function() {
    return (
      <div className="col-sm-6">
        {this.renderConnectedUsers(this.props.totalMembers)}
        <div className="scale">
          {this.renderBar('~', this.props.calculatedScore)}
          {this.renderBar('S', this.props.calculatedScore)}
          {this.renderBar('M', this.props.calculatedScore)}
          {this.renderBar('L', this.props.calculatedScore)}
          {this.renderBar('XL', this.props.calculatedScore)}
        </div>
      </div>
    );
  }
});

module.exports = ScoreBarchart;

