import React from 'react';
import Main from '../layouts/Main';
import ErrorContent from '../components/ErrorContent';

class Error extends React.Component {
  render() {
    return (
      <Main>
        <ErrorContent />
      </Main>
    );
  }
}
Error.propTypes = {
  
};
export default Error;