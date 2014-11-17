var rd3 = require('react-d3');
var React = require('react/addons');

var ScorePiechart = React.createClass({

  propTypes: {
    calculatedScore: React.PropTypes.string.isRequired,
    reporting: React.PropTypes.number.isRequired,
    voteData: React.PropTypes.array.isRequired,
    percentScored: React.PropTypes.number.isRequired
  },

  getPieColor: function(i) {
    if (i === 0) {
      return '#4DE2ED';
    } else {
      return '#cccccc';
    }
  },

  getCapacityColor: function(i) {
    if (i === 0) {
      return '#834DED';
    } else {
      return '#fff';
    }
  },

  render: function() {
    var totalCapacity = 100 - this.props.capacity;

    return (
      <div className="col-sm-6 votes">
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
        <div className="row metrics">
          <div className="col-sm-4 sprint-capacity">
            <h2>{this.props.capacity}%</h2>
            <rd3.PieChart
              data={[this.props.capacity,totalCapacity]}
              width={100}
              height={100}
              radius={50}
              innerRadius={30}
              color={this.getCapacityColor}
            />
            <p>Sprint Capacity</p>
          </div>
          <div className="col-sm-4">
            <div className="score-meter">
              <div className="fill" style={{ height: this.props.percentScored + '%'}}>
                <strong>{this.props.percentScored}%</strong>
              </div>
            </div>
            <p>Backlog Scored</p>
          </div>
          <div className="col-sm-4 timeline">
            <h2>{this.props.remainingWeeks}w</h2>
            <p>Est. Schedule</p>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = ScorePiechart;
