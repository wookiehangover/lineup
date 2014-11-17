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
    };
  },

  componentDidMount: function() {
    var self = this;
    this.props.backlog.on('sync change', function() {
      self.forceUpdate();
    });

    this.props.backlog.on('currentItem', function(index) {
      self.setState({ currentItem: index });
    });
  },

  render: function() {

    return (
      <div className="quicksort-inner">
        {this.props.backlog.map(function(model, i){
          var classes = {
            'quicksort-item': true,
            'active': i == this.state.currentItem,
            'needsUpdate': !!model.changed.score
          };

          classes['item-' + model.get('type')] = true;

          return (<div className={React.addons.classSet(classes)}>+</div>);
        }, this)}
      </div>
    );
  }

});

module.exports = Backlog;

