import React from 'react';
import { browserHistory } from 'react-router';

class SignupForm extends React.Component {
  constructor(props){
    super(props);
	this.state = { 
		showSignupError : false,
		signupErrorMsg : ''
	};
    this.onSubmit = this.handleSubmit.bind(this);
  }



  
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
		  // console.log(res);
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
				  // console.log("DANG DUDE THIS CODE RAN")
				  fetch('/api/enable_google_calendar', {
				      credentials: 'include',
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
            // we should add the error and error message to the state and display it on the error page
              console.log(error);
              console.log(error.message);
              browserHistory.push('/error');
          });
  }

    render() {
        return (
            <div className="information-form center-block">
                <form onSubmit={this.onSubmit} id = "signup-form">
                    <h3>Sign Up</h3>
                    <hr />
					{this.state.showSignupError ? <div className = "alert alert-danger" role="alert"> {this.state.signupErrorMsg} </div> : <div/>}
                    <div className="form-group"><input type="text" name="username" pattern="[A-z0-9]+" title="Username" autoFocus="autofocus" required placeholder="Username" id="username" ref="username"/></div>
                    <div className="form-group"><input type="email" name="login" pattern="[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z]{3}" title="example@email.com"  required placeholder="E-mail address" id="email" ref="email"/></div>
                    <div className="form-group"><input type="password" name="password" required placeholder="Password" id="password" ref ="password"/></div>
                    <div>
                        <label htmlFor="gcalendar">Enable Google Calendar</label> {` `}
                        <input type="checkbox" name="enable_gcalendar" ref = "enableGoogleCalendar" id="gcalendar"/><br />
                    </div>
                    <button className="btn btn-primary" type="submit">Sign Up for Punctual</button>
                </form>
            </div>
        );
    }
}
SignupForm.propTypes = {

};
export default SignupForm;