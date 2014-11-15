/**
 * @jsx React.DOM
 */

var _ = require('lodash');
var rd3 = require('react-d3');
var React = require('react/addons');

var POINT_SCALE = {
  '~': 0,
  'S': 1,
  'M': 3,
  'L': 5,
  'XL': 8
};

var INVERSE_POINT_SCALE = _.zipObject(_.values(POINT_SCALE), _.keys(POINT_SCALE));

var Backlog = React.createClass({

  propTypes: {
    backlog: React.PropTypes.object.isRequired,
    socket: React.PropTypes.object.isRequired
  },

  getInitialState: function() {
    return {
      currentItem: 0,
      room: { members: [] },
      votes: {}
    };
  },

  componentDidMount: function() {
    var self = this;
    this.props.backlog.fetch().then(function() {
      self.forceUpdate();
    });

    this.props.socket.on('room', function(room) {
      self.setState({ room: room });
    });

    this.props.socket.on('msg', function(msg) {
      if (msg.type === "vote") {
        var votes = self.state.votes;
        votes[msg.id] = msg.score;
        self.setState({ votes: votes });
      }
    });

    this.props.socket.on('reconnect', function() {
      self.props.socket.emit('join room', self.state.room);
    });

    this.props.socket.emit('join room', this.props.roomId);
  },

  prevItem: function(e) {
    e.preventDefault();
    var currentIndex = this.state.currentItem;
    var index = currentIndex === 0 ? this.props.backlog.length : currentIndex - 1;
    this.setState({ currentItem: index, votes: {} });
  },

  nextItem: function(e) {
    e.preventDefault();
    var currentIndex = this.state.currentItem;
    var index = currentIndex === this.props.backlog.length ? 0 : currentIndex + 1;
    this.setState({ currentItem: index, votes: {} });
  },

  getVoteData: function(votes) {
    var members = this.state.room.members;
    var voted = _.intersection(_.keys(votes), members).length;

    return [voted, members.length - voted - 1];
  },

  getPieColor: function(i) {
    if (i === 0) {
      return '#4DE2ED';
    } else {
      return '#cccccc';
    }
  },

  calculateVotes: function(votes) {
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

    console.log(avgScore, adjScore, INVERSE_POINT_SCALE[adjScore]);

    return INVERSE_POINT_SCALE[adjScore];
  },

  renderBar: function(label, score) {
    var item = this.props.backlog.at(this.state.currentItem);
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

    if (POINT_SCALE[score] >= POINT_SCALE[label]) {
      classList.active = true;
    }

    return (
      <div className={React.addons.classSet(classList)}></div>
    );
  },

  renderBarChart: function(score) {
    return (
      <div className="scale">
        {this.renderBar('~', score)}
        {this.renderBar('S', score)}
        {this.renderBar('M', score)}
        {this.renderBar('L', score)}
        {this.renderBar('XL', score)}
      </div>
    );
  },

  renderTitle: function(item) {
    var title = item.get('title');

    if (item.get('type') === 'story') {
      title = [
        'As a',
        <span className="title-detail">{item.get('who')}</span>,
        'I want to',
        <span className="title-detail">{item.get('what')}</span>,
        'so that',
        <span className="title-detail">{item.get('why')}</span>
      ];
    }

    return <h1>{title}</h1>;
  },

  renderConnectedUsers: function(memberCount) {
    memberCount -= 1;
    var message = [memberCount, (memberCount === 1 ? 'User': 'Users'),'Connected'];
    return <h3 className="user-status">{message.join(' ')}</h3>
  },

  renderRoomLink: function(roomId) {
    var linkText = location.protocol + '//' + location.host + '/room/';

    return (
      <div className="room-link">
        <a href={linkText + roomId}>{linkText}</a>
        <div className="col-xs-4">
          <input className="form-control" defaultValue={roomId}/>
        </div>
      </div>
    );
  },

  render: function() {
    var item = this.props.backlog.at(this.state.currentItem);

    if (!item) {
      return <div></div>;
    }

    var voteData = this.getVoteData(this.state.votes);
    var reporting = (voteData[0] / (this.state.room.members.length - 1)) * 100;
    var calculatedScore = this.calculateVotes(this.state.votes);

    if (_.isNaN(reporting)) {
      reporting = 0;
    }

    return (
      <div className="story-container">
        <div className="navbar navbar-inverse story-title">
          <div className="container-fluid">
            {this.renderTitle(item)}
          </div>
        </div>
        <div className="container score">
          <div className="col-md-6 votes">
            {this.renderRoomLink(this.state.room.id)}
            <h2 className="team-score">{calculatedScore}</h2>
            <rd3.PieChart
              data={voteData}
              width={230}
              height={230}
              radius={115}
              innerRadius={105}
              color={this.getPieColor}
            />
            <h3>{reporting}% Reporting</h3>
          </div>
          <div className="col-md-6">
            {this.renderConnectedUsers(this.state.room.members.length)}
            {this.renderBarChart(calculatedScore)}
          </div>
        </div>
        <nav>
          <a href="#" onClick={this.prevItem} className="prev glyphicon glyphicon-chevron-left"></a>
          <a href="#" onClick={this.nextItem} className="next glyphicon glyphicon-chevron-right"></a>
        </nav>
      </div>
    );
  }

});

module.exports = Backlog;
