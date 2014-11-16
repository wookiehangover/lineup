/**
 * @jsx React.DOM
 */

var _ = require('lodash');
var React = require('react/addons');
var ScorePiechart = require('./score-piechart');
var ScoreBarchart = require('./score-barchart');
var voteService = require('../lib/vote-service');

var Dashboard = React.createClass({

  propTypes: {
    backlog: React.PropTypes.object.isRequired,
    socket: React.PropTypes.object.isRequired
  },

  getInitialState: function() {
    return {
      currentItem: 0,
      velocity: 10,
      room: { members: [] },
      votes: {}
    };
  },

  componentDidMount: function() {
    var self = this;
    this.props.backlog.on('sync change', function() {
      self.forceUpdate();
    });

    this.props.backlog.fetch();

    this.props.socket.on('room', function(room) {
      self.setState({ room: room });
    });

    this.props.socket.on('msg', function(msg) {
      if (msg.type === "vote") {
        var votes = self.state.votes;
        votes[msg.id] = msg.score;
        self.setState({ votes: votes });
      }

      if (msg.type === 'item'){
        self.setState({ currentItem: msg.currentItem });
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
    var index = currentIndex === 0 ? this.props.backlog.length - 1 : currentIndex - 1;
    this.setState({ currentItem: index, votes: {} });
    this.props.backlog.trigger('currentItem', index);
    this.props.socket.emit('room message', this.props.roomId, { type: 'item', currentItem: index });
  },

  nextItem: function(e) {
    e.preventDefault();
    var currentIndex = this.state.currentItem;
    var index = currentIndex === this.props.backlog.length - 1 ? 0 : currentIndex + 1;
    this.setState({ currentItem: index, votes: {} });
    this.props.backlog.trigger('currentItem', index);
    this.props.socket.emit('room message', this.props.roomId, { type: 'item', currentItem: index });
  },

  handleSave: function() {
    var score = voteService.calculate(this.state.votes);
    var item = this.props.backlog.at(this.state.currentItem);

    item.save({ score: score }).then(function() {
      console.log('Item saved!');
    });
  },

  getVoteData: function(votes) {
    var members = this.state.room.members;
    var voted = _.intersection(_.keys(votes), members).length;
    var total = members.length - voted - 1;

    if (voted === 0) {
      total = total || 1;
    }

    return [voted, total];
  },

  renderTitle: function(item) {
    var title = item.get('title');

    if (item.get('type') === 'story') {
      title = [
        'As a',
        <span className="title-detail">{item.get('who')}</span>,
        'I want',
        <span className="title-detail">{item.get('what')}</span>,
        'so that',
        <span className="title-detail">{item.get('why')}</span>
      ];
    }

    return <h1>{title}</h1>;
  },

  getVelocity: function() {
    var totalWeight = this.props.backlog.reduce(function(sum, item) {
      return sum + voteService.POINT_SCALE[item.get('score')];
    }, 0);

    return totalWeight / this.state.velocity;
  },

  calculateWeeks: function(weeks) {
    if (_.isNaN(weeks) || weeks === 0) {
      return '?.?';
    } else {
      return Math.round(weeks*10) / 10;
    }
  },

  render: function() {
    var item = this.props.backlog.at(this.state.currentItem);

    if (!item) {
      return <div></div>;
    }

    var velocity = this.getVelocity();
    var capacity = velocity >= 1 ? 100 : Math.round(velocity * 100);
    var voteData = this.getVoteData(this.state.votes);
    var reporting = (voteData[0] / (this.state.room.members.length - 1)) * 100;
    var calculatedScore = voteService.calculate(this.state.votes);
    var remainingWeeks = this.calculateWeeks(velocity);
    var percentScored = Math.round(_.pull(this.props.backlog.pluck('score'), '~').length / this.props.backlog.length * 100);

    // console.log(voteData, reporting, calculatedScore);

    if (_.size(this.state.votes) < 1 && !calculatedScore) {
      calculatedScore = item.get('score');
    }

    if (_.isNaN(reporting)) {
      reporting = 0;
    }

    return (
      <div className="story-container">
        <div className="navbar navbar-inverse story-title">
          <div className="container-fluid">
            {this.renderTitle(item)}
            <span className="story-count">{this.state.currentItem + 1} / {this.props.backlog.length}</span>
          </div>
        </div>
        <div className="container score">
          <div className="row">
            <ScorePiechart
              roomId={this.state.room.id || this.props.roomId}
              voteData={voteData}
              reporting={reporting}
              calculatedScore={calculatedScore}
              remainingWeeks={remainingWeeks}
              percentScored={percentScored}
              capacity={capacity}
            />
            <ScoreBarchart
              calculatedScore={calculatedScore}
              totalMembers={this.state.room.members.length}
            />
          </div>
          <div className="row">
            <div className="col-sm-6 col-sm-offset-3 score-controls">
              <button onClick={this.handleSave} className="btn btn-default btn-lg">Save Score</button>
            </div>
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

module.exports = Dashboard;
