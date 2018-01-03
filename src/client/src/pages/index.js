import React from 'react';
import Main from '../layouts/Main';
import HomeContent from '../components/HomeContent';

class Index extends React.Component {


    // Adding functionality to deal with deployment with google calendar

    componentWillMount() {

        console.log(this.props.location);
        var url = this.props.location.pathname;
        if (url === '/api/enable_google_calendar') {
            var queryMap = this.props.location.query;
            var code = queryMap.code;
            fetch(`/api/enable_google_calendar?code=${code}`, {
                method: 'GET',
                credentials: 'include'
            }).then(res => {
                window.location = res.url
            }).catch(err => console.log(err))
        }


    }

    render() {

        return (
            <Main>
                <HomeContent />
            </Main>
        );
    }
}
Index.propTypes = {

};
export default Index;