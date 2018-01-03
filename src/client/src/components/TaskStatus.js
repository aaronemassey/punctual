import React from 'react';
import { Link } from 'react-router';

class TaskStatus extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            loading: true
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
        var taskString = "no tasks";
        if(this.state.numTasks === 1){
            taskString = "1 task"
        }
        else if(this.state.numTasks > 1){
            taskString = this.state.numTasks + " tasks";
        }



        return (
            <p> You currently have <Link href="tasks">{taskString}</Link> in progress!</p>
        );
    }
}
TaskStatus.propTypes = {

};
export default TaskStatus;