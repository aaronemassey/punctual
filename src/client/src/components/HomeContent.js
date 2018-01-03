import React from 'react';
import Welcome from './Welcome';
import HorizSignupForm from './HorizSignupForm';
import TaskStatus from './TaskStatus';

class HomeContent extends React.Component {
  render() {
    return (
      <div className="container">
        <div className="jumbotron">
          {!this.props.isLoggedIn ? <h2>Punctual</h2> : <Welcome />}
          <p>Punctual is a platform that allows users to manage their deadlines and future tasks. Create and manage
            tasks by entering a time estimate and a due date. </p>
          <p>Punctual is useful for people who want to improve their time management skills. With the option of
            coordinating the tasks to Google calendar or sending reminder e-mails when deadlines comes close, you'll
            never find yourself feeling like you never have time again!</p>
          <br/><br/><br/><br/><br/>
            {!this.props.isLoggedIn ? <HorizSignupForm /> : <TaskStatus />}
        </div>
      </div>
    );
  }
}
HomeContent.propTypes = {
  
};
export default HomeContent;