import React from 'react';

class Welcome extends React.Component {



    constructor(props) {
        super(props);
        this.state = {
            loading:true
        }
    }

    componentWillMount()  {
        // This gets repeated elsewhere because the information is needed elsewhere
        // Later on I should clean this up after a good night's rest
        fetch('/api/userInfo',{
            method: "GET",
            credentials: 'include'
        }).then(res => {
            return res.json()
        }).then(json => {
            console.log(json);
            var numTasksInProg = 0;
            var tasksInProgressKeys = Object.keys(json.tasks || {});
            tasksInProgressKeys.map(key => {
                if (!json.tasks[key]['completed']) {
                    numTasksInProg++;
                }
                return numTasksInProg;
            });
            this.setState({
                    username: json['username'],
                    loading: false,
                    numTasks: numTasksInProg
                }
            )
        }).catch(err => console.log(err))
    }

    render() {

        if (this.state.loading) {
            return (
                <h2>Loading ...</h2>
            )
        }

        return (
            <h2>Welcome back, {this.state.username}!</h2>
        );
    }
}
Welcome.propTypes = {

};
export default Welcome;