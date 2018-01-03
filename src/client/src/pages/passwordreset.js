import React from 'react';
import Main from '../layouts/Main';
import PassReset from '../components/PassReset';

class PasswordReset extends React.Component {
    render() {
        return (
            <Main>
                <PassReset />
            </Main>
        );
    }
}
PasswordReset.propTypes = {

};
export default PasswordReset;