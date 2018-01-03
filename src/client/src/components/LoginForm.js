import React from 'react';
import { Link, browserHistory } from 'react-router';

class LoginForm extends React.Component {

  constructor(props){
    super(props);
	this.state = { 
		showLoginError : false,
		loginErrorMsg : ''
	};
    this.onSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
	var context = this;
    var jsonData = JSON.stringify({
        email: this.refs.email.value,
        password: this.refs.password.value
    });

    // console.log(jsonData);
    fetch('/api/login', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: jsonData
        
      })
        .then(function(res){
			console.log(res);
			if(res.status === 401){
				context.setState({
					showLoginError: true,
					loginErrorMsg: 'Incorrect e-mail or password. Please try again.'
				})
				console.log(context.state);
			}
			else if(res.status === 500){
				context.setState({
					showLoginError: true,
					loginErrorMsg: 'The server cannot log you in at this time. Please try another time.'
				})
				console.log(context.state);
			}
			else if(res.status === 200){
				context.setState({
					showLoginError: false,
					loginErrorMsg: ''
				})
				console.log(context.state);
				browserHistory.push('/tasks');
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
      <div className="information-form center-block">
          <form onSubmit={this.onSubmit}>
              <h3>Sign In</h3>
              <hr />
			  {this.state.showLoginError ? <div className = "alert alert-danger" role="alert"> {this.state.loginErrorMsg} </div> : <div/>}
              <div className="form-group"><input type="email" name="email" pattern="[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z]{3}" title="user@mymail.com" autoFocus="autofocus" required placeholder="Email" id="email" ref="email"/></div>
              <div className="form-group"><input type="password" name="password" required placeholder="Password" id="password" ref="password"/></div>
              <div> <Link href="/forgot-password">Forgot password?</Link> </div>
              <button className="btn btn-primary" type="submit">Sign In</button>
              </form>
      </div>
    );
  }
}
LoginForm.propTypes = {

};
export default LoginForm;
