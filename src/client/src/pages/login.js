import React from 'react';
import Main from '../layouts/Main';
import LoginForm from '../components/LoginForm';

class Login extends React.Component {
  render() {
    return (
      <Main>
        <LoginForm />
      </Main>
    );
  }
}
Login.propTypes = {
  
};
export default Login;