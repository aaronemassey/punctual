import React from 'react';
import { Link, browserHistory } from 'react-router';

class PassReset extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            sent: false,
            success: true,
            resetMessage: '',
            resetMessage2: ''
        };
        this.onSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(e) {
        e.preventDefault();
        var context = this;
        var jsonData = JSON.stringify({
            email: this.refs.forgotemail.value
        });

        console.log(jsonData);
        fetch('/api/password-reset', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: jsonData

        })
            .then(function(res){
                console.log(res);
                if(res.status === 200){
                    context.setState({
                        sent: true,
                        success: true,
                        resetMessage: 'The reset e-mail has been sent!',
                        resetMessage2: 'Please check your e-mail to reset your password.'
                    })
                }
                else if(res.status === 401) {
                    context.setState({
                        sent: true,
                        success: false,
                        resetMessage: 'This e-mail address does not exist.',
                        resetMessage2: 'Please enter the correct e-mail, or'
                    })
                }
                else if(res.status === 500){
                    context.setState({
                        sent: true,
                        success: false,
                        resetMessage: 'There was an error sending the password reset e-mail.',
                        resetMessage2: 'Please try again.'
                    })
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
            <div className="information-form reset-form center-block">
                {this.state.sent ?
                    this.state.success ? <div className = "alert alert-success" role="alert"> {this.state.resetMessage}<br/>{this.state.resetMessage2} <Link href="/login">Click here to login!</Link> </div> :
                        <div className = "alert alert-danger" role="alert"> {this.state.resetMessage}<br/>{this.state.resetMessage2} <Link href="/signup"> click here to sign up!</Link> </div>
                    : <div/>
                }
                <h3>Password Reset</h3>
                <p>Please enter your e-mail address to reset your password.</p>
                <form onSubmit={this.onSubmit} id="forgot-email-form">
                    <div className='form-group'>
                        <input type="text" className="form-control" name="forgotemail" pattern="[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z]{3}" title="example@email.com" autoFocus="autofocus" required placeholder="E-mail address" id="forgotemail" ref="forgotemail"/>
                    </div>
                    <button className="btn btn-primary" type="submit">Reset Password</button>
                </form>
            </div>
        );
    }
}
PassReset.propTypes = {

};
export default PassReset;