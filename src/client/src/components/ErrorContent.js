import React from 'react';
import { Link } from 'react-router';

class ErrorContent extends React.Component {
  render() {
    return (
      <div className="container">
        <div className="jumbotron">
          <h2>Sorry, the page you tried cannot be found.</h2>
          <p>You may have typed the address incorrectly or used an outdated link.</p>
          <p>Please click <Link href="/">here</Link> to go back to the home page.</p>
        </div>
      </div>
    );
  }
}
ErrorContent.propTypes = {
  
};
export default ErrorContent;