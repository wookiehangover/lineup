var rd3 = require('react-d3');
var React = require('react/addons');

var ScorePiechart = React.createClass({

  propTypes: {
    roomId: React.PropTypes.string.isRequired,
    calculatedScore: React.PropTypes.string.isRequired,
    reporting: React.PropTypes.number.isRequired,
    voteData: React.PropTypes.array.isRequired
  },

  getPieColor: function(i) {
    if (i === 0) {
      return '#4DE2ED';
    } else {
      return '#cccccc';
    }
  },

  renderRoomLink: function(roomId) {
    var linkText = location.protocol + '//' + location.host + '/room/';

    return (
      <div className="room-link">
        <a href={linkText + roomId}>{linkText}</a>
        <div className="col-xs-3">
          <input className="form-control" defaultValue={roomId}/>
        </div>
      </div>
    );
  },

  render: function() {
    return (
      <div className="col-sm-6 votes">
        {this.renderRoomLink(this.props.roomId)}
        <h2 className="team-score">{this.props.calculatedScore}</h2>
        <rd3.PieChart
          data={this.props.voteData}
          width={230}
          height={230}
          radius={115}
          innerRadius={105}
          color={this.getPieColor}
        />
        <h3>{this.props.reporting}% Reporting</h3>
      </div>
    );
  }
});

module.exports = ScorePiechart;
