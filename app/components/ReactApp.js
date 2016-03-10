/** @jsx React.DOM */

var React = require('react/addons');

/* create factory with griddle component */
var Griddle = React.createFactory(require('griddle-react'));

var fakeData = require('../data/fakeData.js').fakeData;
var columnMeta = require('../data/columnMeta.js').columnMeta;
var resultsPerPage = 200;

var autherName = "Ashok Regar";

/*var ReactApp = React.createClass({

      componentDidMount: function () {
        console.log(fakeData);

      },
      render: function () {
        return (
          <div id="table-area">

             <Griddle results={fakeData}
                      columnMetadata={columnMeta}
                      resultsPerPage={resultsPerPage}
                      tableClassName="table">
             </Griddle>
          </div>
        )
      }
  });
*/
var todoAll;
var todoCompleted;
var todoActive;
var Enter_Key = 13;
var newTodo;

var ToDoApp = React.createClass({
      getInitialState : function(){
        return {
            nowShowing : todoAll,
            newTodo : ''
          };
      },
      componentDidMount : function(){
        var setState = this.setState;
        var router = Router({
            '/' : setState.bind(this , {nowShowing : todoAll}),
            '/active' : setState.bind(this, {nowShowing : todoActive}),
            '/completed' : setState.bind(this, {nowShowing : todoCompleted})
        });
        router.init('/');
      },
      handleNewTodoKeyDown: function (event) {
        if (event.keyCode !== ENTER_KEY) {
          return;
        }

        event.preventDefault();

        var val = this.state.newTodo.trim();

        if (val) {
          this.props.model.addTodo(val);
          this.setState({newTodo: ''});
        }
      },

      handleChange : function(event) {
        this.setState({newTodo : event.target.value});
      },

      render : function(){
          return(
              <div>   
                <input type="text" placeholder="Your name" />
                <input type="text" placeholder="Say something..." />
              </div>
          );
      },
});

var ReactApp = React.createClass({
      componentDidMount : function(){
        console.log(autherName);
      },

      render : function(){
        return(
            <div id="contact">
                <h1>Send an email</h1>
                <form action="http://127.0.0.1:4444/myaction" method="post">
                    <fieldset>
                        <label for="name">Name:</label>
                        <input type="text" id="name" name="name" placeholder="Enter your full name" />

                        <label for="email">Email:</label>
                        <input type="email" id="email" placeholder="Enter your email address" />

                        <label for="message">Message:</label>
                        <textarea id="message" placeholder="What's on your mind?"></textarea>

                        <input type="submit" value="Send message" />

                    </fieldset>
                </form>
            </div>             
          );
      }
  });


/* Module.exports instead of normal dom mounting */
module.exports = ReactApp;