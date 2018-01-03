import React from 'react';
import feUtil from '../feUtil';
import moment from 'moment';
import {browserHistory, Link} from 'react-router';

const timeWorkedInputRegex = '(([0-9]+[hH]){0,1}([0-9]+[mM]){0,1}){1}';


class TaskTable extends React.Component {


    constructor(props) {
        super(props);
        this.state = {loading: true};
    }

    deleteFinishedTask(finishedTasksIndex) {

        var task = this.state.finishedTasks[finishedTasksIndex];
        this.state.finishedTasks.splice(finishedTasksIndex, 1);

        console.log('Deleting task...');
        fetch(`/api/tasks/${task.name}`, {
            credentials: 'include',
            method: 'DELETE'
        })
        window.changedTask = task.name;
        window.taskActionVerb = "deleted ";
        this.setState(this.state);
    }

    deleteUnfinishedTask(unFinishedTasksIndex) {

        feUtil.debugPrint(unFinishedTasksIndex);

        var task = this.state.unFinishedTasks[unFinishedTasksIndex];
        this.state.unFinishedTasks.splice(unFinishedTasksIndex, 1);

        console.log('Deleting task...');
        fetch(`/api/tasks/${task.name}`, {
            credentials: 'include',
            method: 'DELETE'
        })
        window.changedTask = task.name;
        window.taskActionVerb = "deleted ";
        this.setState(this.state);
    }

    unCompleteTask(finishedTasksIndex) {
        var unCompletedTask = this.state.finishedTasks[finishedTasksIndex];
        unCompletedTask.completed = false;
        this.state.finishedTasks.splice(finishedTasksIndex, 1);
        this.state.unFinishedTasks.push(unCompletedTask);
        this.state.unFinishedTasks.sort((a, b) => a.deadline - b.deadline);


        this.setState(this.state, _ => {
            this.putUpdatedTask(unCompletedTask);
        })
    }

    completedTask(unFinishedTasksIndex) {
        var completedTask = this.state.unFinishedTasks[unFinishedTasksIndex];
        completedTask.completed = true;
        this.state.unFinishedTasks.splice(unFinishedTasksIndex, 1);
        this.state.finishedTasks.push(completedTask);
        this.state.finishedTasks.sort((a, b) => a.deadline - b.deadline);
        this.state.finishedTasks.push()

        this.setState(this.state, _ => {
            this.putUpdatedTask(completedTask)
        })
    }

    putUpdatedTask(task, thenCall) {

        console.log(task)

        fetch(`/api/tasks/${task.name}`, {
            method: 'PUT',
            body: JSON.stringify(task),
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => {
            if (thenCall) {
                return thenCall
            }
        })
    }


    componentWillMount() {
        fetch('/api/tasks', {
                method: "GET",
                credentials: 'include',
            }
        ).then(res => {
            // redirect if user isn't logged in, quick hacky fix
            if (!document.cookie) {
                browserHistory.push('/login');
            }
            return res.json();
        })
            .then(json => {
                console.log(json);
                var tasksObject = json;
                var unFinishedTasks = [];
                var finishedTasks = [];
                for (var taskKey in tasksObject) {
                    var taskElem = tasksObject[taskKey];
                    var dueDate = moment.unix(taskElem.deadline).startOf('day')
                    var dueTime = json.deadline - dueDate / 1000;
                    taskElem.dueDate = dueDate;
                    taskElem.dueTime = dueTime;

                    if (taskElem.completed) {
                        finishedTasks.push(taskElem);
                    }
                    else {
                        unFinishedTasks.push(taskElem);
                    }
                }

                // Sort these by deadline
                unFinishedTasks = unFinishedTasks.sort((a, b) => a.deadline - b.deadline);
                finishedTasks = finishedTasks.sort((a, b) => a.deadline - b.deadline);

                this.setState({
                    finishedTasks: finishedTasks,
                    unFinishedTasks: unFinishedTasks,
                    loading: false
                })
            })
            .catch(err => console.log(err));
    }

    render() {
        // we shouldn't see this page if you aren't logged in
        // if(!this.props.isLoggedIn) {
        //     browserHistory.push('/login');
        // }

        feUtil.debugPrint(window.newTask);
        if (this.state.loading) {
            return (
                <div className="container">
                    <div className="jumbotron">
                        <p className="text-center">Loading tasks...</p>
                    </div>
                </div>
            )
        }


        const taskTableHeader =
            (
                <tr className="borderless">
                    <th>Name</th>
                    <th>Due Date</th>
                    <th>Estimate</th>
                    <th>Time Worked</th>
                </tr>);


        var unFinishedIndexCount = -1;
        const unfinishedTasksTable = this.state.unFinishedTasks.map(elem => {
            unFinishedIndexCount++;
            let unFinishedIndexCountCopy = unFinishedIndexCount;

            let linkObj = {
                pathname: `/tasks/${elem.name}`,
                state: {editingTask: true}
            }

            if (this.state.addingTimeToTask === unFinishedIndexCountCopy) {
                return (
                    <tr>
                        <td><Link to={"tasks/" + elem.name}>{elem.name}</Link></td>
                        <td>{elem.dueDate.format('MM/DD/YYYY')}</td>
                        <td>{feUtil.parseSecondsToEstimate(elem.estimate)}</td>
                        <td>{feUtil.parseSecondsToEstimate(elem.timeWorked)}</td>
                        <td>

                            <form ref={"addTimeForm"}
                                onSubmit={e => {
                                    e.preventDefault();
                                    let addedHours = Number(this.refs.addedHours.value) * 60 * 60;
                                    console.log(addedHours)
                                    let addedMinutes = Number(this.refs.addedMinutes.value) * 60 + addedHours;
                                    console.log(addedMinutes)
                                    console.log(this.state.unFinishedTasks[unFinishedIndexCountCopy])
                                    this.state.unFinishedTasks[unFinishedIndexCountCopy].timeWorked += addedMinutes;
                                    this.putUpdatedTask(this.state.unFinishedTasks[unFinishedIndexCountCopy]);
                                    console.log(this.state.unFinishedTasks[unFinishedIndexCountCopy])
                                    this.setState({
                                        unFinishedTasks: this.state.unFinishedTasks,
                                        addingTimeToTask: false
                                    });
                                }}

                            >
                                <input ref={"addedHours"} step={"any"} min={"0"} autoFocus={true} type="number" placeholder={"Hours"} className={"tasksTimeAddBox"}/>
                                <input ref={"addedMinutes"} step={"any"} min={"0"} type="number" placeholder={"Minutes"} className={"tasksTimeAddBox"}/>
                                <button type={"submit"}>
                                    Add Time
                                </button>
                                <button onClick={_ => {this.setState({
                                    addingTimeToTask:false
                                })}}>
                                    Cancel
                                </button>

                            </form>

                        </td>
                    </tr>
                )
            }

            return (
                <tr>
                    <td><Link to={"tasks/" + elem.name}>{elem.name}</Link></td>
                    <td>{elem.dueDate.format('MM/DD/YYYY')}</td>
                    <td>{feUtil.parseSecondsToEstimate(elem.estimate)}</td>
                    <td>{feUtil.parseSecondsToEstimate(elem.timeWorked)}</td>
                    {/*<div>*/}
                    <td className="transparent-item btn-shrink">

                        <button onClick={_ => {
                            this.setState({
                                addingTimeToTask: unFinishedIndexCountCopy
                            })}
                        }
                                className={"glyphicon glyphicon-time add-time"}
                                title="Add Time"
                        />

                        <button onClick={_ => this.completedTask(unFinishedIndexCountCopy)}
                                className="glyphicon glyphicon-ok complete-task" title="Complete Task"/>

                        <Link to={linkObj}>
                            <button className="glyphicon glyphicon-pencil edit-task" title="Edit Task"/>
                        </Link>

                        <button
                            onClick=
                                {
                                    _ => {
                                        if (window.confirm(`Are you sure you want to delete "${elem.name}"?`)) {
                                            this.deleteUnfinishedTask(unFinishedIndexCountCopy)
                                        }
                                    }
                                }
                            className="glyphicon glyphicon-remove remove-task"
                            title="Delete Task" />
                    </td>
                    {/*</div>*/}
                </tr>
            )
        })

        var finishedTasksIndex = -1;
        const finishedTasksTable = this.state.finishedTasks.map(elem => {
            finishedTasksIndex++;
            let finishedTasksIndexCopy = finishedTasksIndex;

            let linkObj = {
                pathname: `/tasks/${elem.name}`,
                state: {editingTask: true}
            }


            return (
                <tr>
                    <td><Link to={"tasks/" + elem.name}>{elem.name}</Link></td>
                    <td>{elem.dueDate.format('MM/DD/YYYY')}</td>
                    <td>{feUtil.parseSecondsToEstimate(elem.estimate)}</td>
                    <td>{feUtil.parseSecondsToEstimate(elem.timeWorked)}</td>
                    {/*<div className={"finishedTasks"}>*/}
                    <td className="transparent-item btn-shrink">
                        <button className="glyphicon glyphicon-collapse-up button-spacer"/>
                        <button onClick={_ => {
                            this.unCompleteTask(finishedTasksIndexCopy)
                        }} className="glyphicon glyphicon-arrow-up uncomplete-task" title="Move back to Incomplete"/>
                        <Link to={linkObj}>
                            <button className="glyphicon glyphicon-pencil edit-task" title="Edit Task"/>
                        </Link>
                        <button

                            onClick=
                                {
                                    _ => {

                                        if (window.confirm(`Are you sure you want to delete "${elem.name}"?`)) {
                                            this.deleteFinishedTask(finishedTasksIndexCopy)
                                        }
                                    }
                                }

                            className="glyphicon glyphicon-remove remove-task"
                            title="Delete Task"/>
                    </td>
                    {/*</div>*/}
                </tr>
            )
        })

        const unfinishedTasksTableContent =
            <table align="center" className="table borderless">
                <tbody>
                {taskTableHeader}
                {unfinishedTasksTable}
                </tbody>
            </table>

        const finishedTasksTableContent =
            <table align="center" className="table borderless">
                <tbody>
                {taskTableHeader}
                {finishedTasksTable}
                </tbody>
            </table>


        let changedTask = window.changedTask;
        let taskActionVerb = window.taskActionVerb;
        window.changedTask = undefined;
        window.taskActionVerb = undefined;

      return (

        <div className="container">
          {changedTask ?
            <div className="alert alert-success text-center fade-out">Successfully {taskActionVerb}
              task: {changedTask} </div> :
            <div/>}

          <h2 className="text-center">Your Tasks</h2>
          {this.state.unFinishedTasks.length > 0 ?
            <div>
              <h3 className="text-center">Incomplete Tasks</h3>
              {unfinishedTasksTableContent}
            </div> : <div><h3 className="text-center">You currently have no tasks in progress.
              Click <a href="/tasks/new_task">here</a> to create a new task!</h3></div>}
          {this.state.finishedTasks.length > 0 ?
            <div><h3 className="text-center">Completed Tasks</h3>
              {finishedTasksTableContent}
            </div> : <div/>
          }
        </div>
      );
    }
}

TaskTable.propTypes = {};
export default TaskTable;