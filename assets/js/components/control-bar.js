var React = require('react/addons');
var InlineSvg = require('react-inlinesvg');

var ControlBar = React.createClass({

  propTypes: {
    roomId: React.PropTypes.string.isRequired,
    totalMembers: React.PropTypes.number.isRequired,
    showControls: React.PropTypes.bool.isRequired,
    flash: React.PropTypes.string.isRequired,
    handleSave: React.PropTypes.func.isRequired,
    handleReset: React.PropTypes.func.isRequired
  },

  handleSave: function(e) {
    e.preventDefault();
    this.props.handleSave();
  },

  handleReset: function(e) {
    e.preventDefault();
    this.props.handleReset();
  },

  renderControls: function() {
    if (this.props.showControls === false) {
      return '';
    }
    var flash = this.props.flash;

    return (
      <div className="col-sm-6 score-controls">
        <button onClick={this.handleSave} className="btn btn-default">Save Score</button>
        <button onClick={this.handleReset} className="btn btn-default">Reset</button>
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
          <input className="form-control" defaultValue={roomId}/>
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
