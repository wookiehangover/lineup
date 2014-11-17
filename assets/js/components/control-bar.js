var React = require('react/addons');
var InlineSvg = require('react-inlinesvg');
var _ = require('lodash');

var ControlBar = React.createClass({

  propTypes: {
    roomId: React.PropTypes.string.isRequired,
    totalMembers: React.PropTypes.number.isRequired,
    showControls: React.PropTypes.bool.isRequired,
    flash: React.PropTypes.string.isRequired,
    handleSave: React.PropTypes.func.isRequired,
    handleReset: React.PropTypes.func.isRequired,
    changeRoomId: React.PropTypes.func.isRequired
  },

  handleSave: function(e) {
    e.preventDefault();
    this.props.handleSave();
  },

  handleReset: function(e) {
    e.preventDefault();
    this.props.handleReset();
  },

  updateRoomName: _.debounce(function() {
    var node = this.refs.roomName.getDOMNode();
    this.props.changeRoomId(node.value);
  }, 200),

  renderControls: function() {

    var classes = React.addons.classSet({
      'btn': true,
      'btn-default': true,
      'hidden': !this.props.showControls
    });
    var flash = this.props.flash;

    return (
      <div className="col-sm-6 score-controls">
        <button onClick={this.handleSave} className={classes}>Save Score</button>
        <button onClick={this.handleReset} className={classes}>Reset</button>
        {flash ? <div className="flash alert alert-success"><p>{flash}</p></div> : ''}
      </div>
    );
  },

  renderConnectedUsers: function() {
    var memberCount = this.props.totalMembers - 1;
    var message = [memberCount, (memberCount === 1 ? 'User': 'Users'),'Connected'];

    return (
      <p className="user-status">{message.join(' ')}</p>
    );
  },

  renderRoomLink: function(roomId) {
    var linkText = location.protocol + '//' + location.host + '/room/';

    return (
      <div className="col-sm-6 room-link">
        <InlineSvg src="/images/iphone.svg"></InlineSvg>
        <a href={linkText + roomId}>{linkText}</a>
        <div className="col-xs-3">
          <input ref="roomName" className="form-control" defaultValue={roomId} onChange={this.updateRoomName}/>
        </div>
        {this.renderConnectedUsers()}
      </div>
    );
  },

  render: function() {
    return (
      <div className="control-bar row">
        {this.renderRoomLink(this.props.roomId)}
        {this.renderControls()}
      </div>
    );
  }
});

module.exports = ControlBar;
