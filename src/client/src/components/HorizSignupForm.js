import React from 'react';
import { browserHistory } from 'react-router';

class HorizSignupForm extends React.Component {
  
  constructor(props){
    super(props);
      this.state = {
          showSignupError : false,
          signupErrorMsg : ''
      };
    this.onSubmit = this.handleSubmit.bind(this);
  }
  
  // we need to implement some type of user feedback or redirect after successful signup
   handleSubmit(e) {
    e.preventDefault();
    var context = this;
    var jsonData = {
        username: this.refs.username.value,
        email: this.refs.email.value,
        password: this.refs.password.value,
        enableGoogleCalendar: this.refs.enableGoogleCalendar.checked
    };

      // console.log(jsonData.username);
      // console.log(jsonData.enableGoogleCalendar);

      fetch('/api/signup', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(jsonData)

      }).then(function(res){
          console.log(res);
          console.log(res.body);
          if(res.status === 401){
              context.setState({
                  showSignupError: true,
                  signupErrorMsg: 'This e-mail already exists. Please use a different e-mail.'
              })
              // console.log(context.state);
          }
          else if(res.status === 403){
            context.setState({
              showSignupError: true,
              signupErrorMsg: 'This password is too weak. Please use a password with at least 6 characters.'
            })
            // console.log(context.state);
          }
          else if(res.status === 500){
              context.setState({
                  showSignupError: true,
                  signupErrorMsg: 'The server cannot create this account at this time. Please try another time.'
              })
              // console.log(context.state);
          }
          else if(res.status === 200){
              context.setState({
                  showSignupError: false,
                  signupErrorMsg: ''
              })
              // If enabling google calendar for creation of events
              // grab the Oauth2 code for use with backend
              if (jsonData.enableGoogleCalendar) {
                  fetch('/api/enable_google_calendar', {
                      method: 'POST',
                  }).then(response => {
                      return response.json();
                  }).then(json => {
                      json = JSON.parse(json);
                      window.location.href = json.redirectUrl;
                  }).catch(err => console.log(err));
              }
              // console.log(context.state);
              browserHistory.push('/');

          }
      })
          .catch(function(error){
              console.log(error);
              console.log(error.message);
              browserHistory.push('/error');
          });
   }

    render() {
        return (
            <div className="horizontal-signup">
                <form onSubmit={this.onSubmit} id = "signup-form">
                    {this.state.showSignupError ? <div className = "alert alert-danger" role="alert"> {this.state.signupErrorMsg} </div> : <div/>}
                    <div><input type="text" name="username" pattern="[A-z0-9]+" title="Username" autoFocus="autofocus" required placeholder="Username" id="username" ref="username"/>
                        <input type="text" name="login" pattern="[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z]{3}" title="example@email.com"  required placeholder="E-mail address" id="email" ref="email"/>
                        <input type="password" name="password" required placeholder="Password" id="password" ref="password"/>
                        <button className="btn btn-primary" type="submit">Sign Up</button></div>
                    <br/>
                    <label htmlFor="gcalendar">Enable Google Calendar</label> {` `}
                    <input type="checkbox" name="enable_gcalendar" ref = "enableGoogleCalendar" id="gcalendar"/>
                </form>
            </div>
    );
    }
    }
    HorizSignupForm.propTypes = {

    };
    export default HorizSignupForm;