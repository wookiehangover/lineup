/**
 * @jsx React.DOM
 */

var React = require('react/addons');

var Backlog = React.createClass({

  propTypes: {
    backlog: React.PropTypes.object.isRequired
  },

  getInitialState: function() {
    return {
      currentItem: 0
    };
  },

  componentDidMount: function() {
    var self = this;
    this.props.backlog.on('sync change', function() {
      self.forceUpdate();
    });
  },

  render: function() {

    return (
      <div className="quicksort-inner">
        {this.props.backlog.map(function(model){
          var classes = ['quicksort-item', 'item-' + model.get('type')].join(' ')
          return (<div className={classes}>+</div>);
        }, this)}
      </div>
    );
  }

});

module.exports = Backlog;

