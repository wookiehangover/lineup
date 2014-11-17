/**
 * @jsx React.DOM
 */

var _ = require('lodash');
var React = require('react/addons');
var ControlBar = require('./control-bar');
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
      votes: {},
      flash: '',
      needsSave: false
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
        var calculatedScore = voteService.calculate(votes);
        self.setState({
          votes: votes,  needsSave: true,
          calculatedScore: calculatedScore
        });
      }

      if (msg.type === 'item'){
        self.setState({ currentItem: msg.currentItem });
      }
    });

    this.props.socket.on('reconnect', function() {
      self.props.socket.emit('join room', self.props.roomId);
    });

    this.props.socket.emit('join room', this.props.roomId);
  },

  prevItem: function(e) {
    e.preventDefault();
    var currentIndex = this.state.currentItem;
    var index = currentIndex === 0 ? this.props.backlog.length - 1 : currentIndex - 1;
    this.setState({
      votes: {},
      needsSave: false,
      currentItem: index,
      calculatedScore: undefined
    });
    this.props.backlog.trigger('currentItem', index);
    this.props.socket.emit('room message', this.props.roomId, { type: 'item', currentItem: index });
  },

  nextItem: function(e) {
    e.preventDefault();
    var currentIndex = this.state.currentItem;
    var index = currentIndex === this.props.backlog.length - 1 ? 0 : currentIndex + 1;
    this.setState({
      votes: {},
      needsSave: false,
      currentItem: index,
      calculatedScore: undefined
    });
    this.props.backlog.trigger('currentItem', index);
    this.props.socket.emit('room message', this.props.roomId, { type: 'item', currentItem: index });
  },

  flash: function(msg) {
    var self = this;
    this.setState({ flash: msg });
    setTimeout(function() {
      self.setState({ flash: '' });
    }, 3e3);
  },

  changeRoomId: function(roomId) {
    this.setProps({ roomId: roomId });
    this.props.socket.emit('join room', roomId);
    this.flash('Room name updated');
  },

  handleSave: function() {
    var self = this;
    var item = this.props.backlog.at(this.state.currentItem);
    var score = _.size(this.state.votes) >= 1 ?
      voteService.calculate(this.state.votes) : item.get('score');

    item.save({ score: score }).then(function() {
      self.flash('Item Updated');
    });
  },

  handleReset: function() {
    var self = this;
    var item = this.props.backlog.at(this.state.currentItem);
    item.fetch().then(function() {
      self.flash('Item & votes reset');
      self.setState({ votes: {} });
      self.props.socket.emit('room message', self.props.roomId, {
        type: 'item',
        currentItem: self.state.currentItem
      });
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

  getPercentScored: function() {
    var unweighedCount = _.pull(this.props.backlog.pluck('score'), '~').length;
    return Math.round(unweighedCount / this.props.backlog.length * 100);
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

  updateScore: function(score) {
    var item = this.props.backlog.at(this.state.currentItem);
    item.set({ score: score }, { silent: true });
    this.setState({ needsSave: true });
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

  render: function() {
    var item = this.props.backlog.at(this.state.currentItem);

    if (!item) {
      return <div></div>;
    }

    var velocity = this.getVelocity();
    var capacity = velocity >= 1 ? 100 : Math.round(velocity * 100);
    var voteData = this.getVoteData(this.state.votes);
    var remainingWeeks = this.calculateWeeks(velocity);
    var percentScored = this.getPercentScored();

    var calculatedScore = this.state.calculatedScore;
    if (_.size(this.state.votes) < 1 && !calculatedScore) {
      calculatedScore = item.get('score');
    }

    var reporting = (voteData[0] / (this.state.room.members.length - 1)) * 100;
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
          <ControlBar
            flash={this.state.flash}
            roomId={this.state.room.id || this.props.roomId}
            handleSave={this.handleSave}
            handleReset={this.handleReset}
            changeRoomId={this.changeRoomId}
            totalMembers={this.state.room.members.length}
            showControls={this.state.needsSave}
          />
          <div className="row">
            <ScorePiechart
              voteData={voteData}
              reporting={reporting}
              calculatedScore={calculatedScore}
              remainingWeeks={remainingWeeks}
              percentScored={percentScored}
              capacity={capacity}
            />
            <ScoreBarchart
              updateScore={this.updateScore}
              calculatedScore={calculatedScore}
            />
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
