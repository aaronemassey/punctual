import React from 'react';
import Main from '../layouts/Main';
import SignupForm from '../components/SignupForm';

class Signup extends React.Component {
  render() {
    return (
      <Main>
        <SignupForm />
      </Main>
    );
  }
}
Signup.propTypes = {
  
};
export default Signup;