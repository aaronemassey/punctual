import React from 'react';
import { Link, browserHistory } from 'react-router'

class NavBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading:true
    }
  }

    handleLogout(e) {
        e.preventDefault()
        fetch('/api/logout', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        })
            .then(function(body){
                console.log(body);
                browserHistory.push('/login');
            })
            .catch(function(error){
                console.log(error);
                console.log(error.message);
                browserHistory.push('/error');
            });
    }

  componentWillMount() {
    // This gets repeated elsewhere because the information is needed elsewhere
    // Later on I should clean this up after a good night's rest
    fetch('/api/userInfo', {
      method: "GET",
      credentials: 'include'
    }).then(res => {
      return res.json()
    }).then(json => {
      this.setState({
          username: json['username'],
          loading: false
        }
      )
    }).catch(err => console.log(err))
  }

    // the logout button should just directly fetch to the logout endpoint
    render() {
        return (
            <nav className="nav-bar navbar-default navbar-static-top navbar-collapse">
                <div className="container">
                    <ul>
                        <li><Link href="/" id="nav-bar-brand">Punctual</Link></li>
                        {document.cookie ?

                            <span id="nav-task">
                            <li><Link href="/tasks" >Tasks</Link></li>
                            <li><Link href="/tasks/new_task" >Create Task</Link></li>
                            </span>

                            : ""}
                        {!document.cookie ?
                            <li>
                                <ul id="nav-account">
                                    <li>
                                        <Link href="/login" id="nav-login" >Sign in</Link>
                                        {` `}or{` `}
                                        <Link href="/signup" id="nav-signup">Sign up</Link>
                                    </li>
                                    <li>
                                        <Link href="/forgot-password" id="nav-forgot">Forgot password?</Link>
                                    </li>
                                </ul>
                            </li>
                            :
                          <li>
                              <ul id="nav-account">
                                  <li>
                                      <Link id="nav-welcome">{this.state.username ? `Welcome, ${this.state.username}` : "System Error: Please logout."}</Link>
                                  </li>
                                  <li>
                                    <Link href="/login" className="link nav-account" id="nav-logout" onClick={this.handleLogout}>Logout</Link>
                                  </li>
                              </ul>
                          </li>
                        }
                    </ul>
                </div>
            </nav>
        );
    }
}
NavBar.propTypes = {

};
export default NavBar;