/**
 * @jsx React.DOM
 */

var _ = require('lodash');
var React = require('react/addons');

var Backlog = React.createClass({

  propTypes: {
    backlog: React.PropTypes.object.isRequired
  },

  getInitialState: function() {
    return {
      currentItem: 0
    }
  },

  componentDidMount: function() {
    var self = this;
    this.props.backlog.fetch().then(function() {
      self.forceUpdate();
    });
  },

  prevItem: function() {
    var currentIndex = this.state.currentItem;
    var index = currentIndex === 0 ? this.props.backlog.length : currentIndex - 1;
    this.setState({ currentItem: index });
  },

  nextItem: function() {
    var currentIndex = this.state.currentItem;
    var index = currentIndex === this.props.backlog.length ? 0 : currentIndex + 1;
    this.setState({ currentItem: index });
  },

  renderBar: function(score) {
    var item = this.props.backlog.at(this.state.currentItem);
    var classList = {
      bar: true
    };

    switch(score) {
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

    if (item && item.get('score') === score) {
      classList.active = true;
    }

    return (
      <div className={React.addons.classSet(classList)}></div>
    );
  },

  handleKeyDown: function(e) {
    console.log(e.keyCode)
  },

  render: function() {
    var item = this.props.backlog.at(this.state.currentItem);
    return (
      <div onKeyDown={this.handleKeyDown}>
        <div className="item-title-card">
          <h1>{item ? item.get('title') : '...'}</h1>
        </div>
        <div className="scale container">
          {this.renderBar('~')}
          {this.renderBar('S')}
          {this.renderBar('M')}
          {this.renderBar('L')}
          {this.renderBar('XL')}
        </div>
        <nav>
          <span onClick={this.prevItem} className="prev glyphicon glyphicon-chevron-left"></span>
          <span onClick={this.nextItem} className="next glyphicon glyphicon-chevron-right"></span>
        </nav>
      </div>
    );
  }

});

module.exports = Backlog;
