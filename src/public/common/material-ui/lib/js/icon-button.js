var React = require('react');
var Classable = require('./mixins/classable');
var EnhancedButton = require('./enhanced-button');
var FontIcon = require('./font-icon');
var Tooltip = require('./tooltip');

var IconButton = React.createClass({displayName: "IconButton",

  mixins: [Classable],

  propTypes: {
    className: React.PropTypes.string,
    disabled: React.PropTypes.bool,
    iconClassName: React.PropTypes.string,
    onBlur: React.PropTypes.func,
    onFocus: React.PropTypes.func,
    tooltip: React.PropTypes.string,
    touch: React.PropTypes.bool
  },

  getInitialState: function() {
    return {
      tooltipShown: false 
    };
  },

  componentDidMount: function() {
    if (this.props.tooltip) {
      this._positionTooltip();
    }

    if (this.props.iconClassName && this.props.children) {
      var warning = 'You have set both an iconClassName and a child icon. ' +
                    'It is recommended you use only one method when adding ' +
                    'icons to IconButtons.';
      console.warn(warning);
    }
  },

  render: function() {
    var $__0=
      
      
         this.props,tooltip=$__0.tooltip,touch=$__0.touch,other=(function(source, exclusion) {var rest = {};var hasOwn = Object.prototype.hasOwnProperty;if (source == null) {throw new TypeError();}for (var key in source) {if (hasOwn.call(source, key) && !hasOwn.call(exclusion, key)) {rest[key] = source[key];}}return rest;})($__0,{tooltip:1,touch:1});
    var classes = this.getClasses('mui-icon-button');
    var tooltip;
    var fonticon;

    if (this.props.tooltip) {
      tooltip = (
        React.createElement(Tooltip, {
          ref: "tooltip", 
          className: "mui-icon-button-tooltip", 
          label: tooltip, 
          show: this.state.tooltipShown, 
          touch: touch})
      );
    }

    if (this.props.iconClassName) {
      fonticon = (
        React.createElement(FontIcon, {className: this.props.iconClassName})
      );
    }

    return (
      React.createElement(EnhancedButton, React.__spread({},  other, 
        {ref: "button", 
        centerRipple: true, 
        className: classes, 
        onBlur: this._handleBlur, 
        onFocus: this._handleFocus, 
        onMouseOut: this._handleMouseOut, 
        onMouseOver: this._handleMouseOver}), 

        tooltip, 
        fonticon, 
        this.props.children

      )
    );
  },

  _positionTooltip: function() {
    var tooltip = this.refs.tooltip.getDOMNode();
    var tooltipWidth = tooltip.offsetWidth;
    var buttonWidth = 48;

    tooltip.style.left = (tooltipWidth - buttonWidth) / 2 * -1 + 'px';
  },

  _showTooltip: function() {
    if (!this.props.disabled) this.setState({ tooltipShown: true });
  },

  _hideTooltip: function() {
    this.setState({ tooltipShown: false });
  },

  _handleBlur: function(e) {
    this._hideTooltip();
    if (this.props.onBlur) this.props.onBlur(e);
  },

  _handleFocus: function(e) {
    this._showTooltip();
    if (this.props.onFocus) this.props.onFocus(e);
  },

  _handleMouseOut: function(e) {
    if (!this.refs.button.isKeyboardFocused()) this._hideTooltip();
    if (this.props.onMouseOut) this.props.onMouseOut(e);
  },

  _handleMouseOver: function(e) {
    this._showTooltip();
    if (this.props.onMouseOver) this.props.onMouseOver(e);
  }

});

module.exports = IconButton;