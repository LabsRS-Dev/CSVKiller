define(['react'],function(React){
    "use strict";
    /**
     * @jsx React.DOM
     */
    var List = React.createClass({
        getInitialState:function(){
           return {
              curState : 'init'
           };
        },

        getDefaultProps:function(){
           return{
               name:"szf"
           }
        },
        handleClick:function(){
           console.log('2323')
        },
        render:function(){
            return(
                <div className="List" onClick={this.handleClick}>
                    <h1>Hello {this.props.name}! {this.state.curState}</h1>
                    <p>
                        It is {this.props.date.toTimeString()}
                    </p>
                </div>
            )
        }
    });

    return List;
});