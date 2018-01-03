import React from 'react';
import feUtil from '../feUtil';
import Main from '../layouts/Main'
import { browserHistory } from 'react-router';
import DatePicker from 'react-datepicker'

import Moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';



const estimateInputRegex = '(([0-9]+[hH]){0,1}([0-9]+[mM]){0,1}){1}';

class Task extends React.Component {

  constructor(props) {
    super(props);
    let editingTask = false;
    if (props.location) {
      if (props.location.state) {
        editingTask = props.location.state.editingTask;
      }
    }
    this.state = {
      loading: true,
      dueDate: Moment(),
      editingTask: editingTask
    };

        this.edit = this.handleEdit.bind(this);
        this.delete = this.handleDelete.bind(this);
        this.submitEdit = this.handleSubmitEdit.bind(this);
        this.create = this.handleCreate.bind(this);
        this.completeTask = this.handleCompleteTask.bind(this);
    }

  handleDatePickerChange = m => {
    this.setState({dueDate: m}, _ => this.render());
  }

  handleCompleteTask(e) {
    var oldTaskValues = {
      name: this.state.task.name,
      estimate: this.state.task.estimate,
      deadline: this.state.task.deadline,
      timeWorked: this.state.task.timeWorked,
      reminderRequested: this.state.task.reminderRequested,
      reminderSent: this.state.task.reminderSent,
      reminderTime: this.state.task.reminderTime,
      description: this.state.task.description,
      completed: !this.state.task.completed,
    };

    // console.log(oldTaskValues)
    fetch(`/api/tasks/${oldTaskValues.name}`, {
      method: 'PUT',
      body: JSON.stringify(oldTaskValues),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    }).then(res => {
      this.setState({
        editingTask: false,
        task: oldTaskValues
      }, _ => {
        this.render();
      })
    }).catch(err => console.log(err))

  }


  handleCreate(e) {

    e.preventDefault();

    var dueDateSeconds = this.state.dueDate.startOf('day') / 1000;
    var dueTime = feUtil.parseDueTimeString(this.refs.dueTime.value);
    var deadline = dueDateSeconds + dueTime;

    var newTask = {
      name: this.refs.taskName.value,
      estimate: this.refs.estimateHours.value * 60 * 60 + this.refs.estimateMinutes.value * 60,
      deadline: deadline,
      description: this.refs.description.value,
      reminderRequested: this.refs.reminderRequested.checked,
      timeWorked: 0
    }

    var errMessage = feUtil.taskIsInvalidMessage(newTask);

    if (errMessage) {
      alert(errMessage);
      return;
    }

    feUtil.debugPrint(newTask);

    fetch(`/api/tasks/${newTask.name}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(newTask)

    }).then(res => {
      this.setState({
        new_task: false,
        editingTask: false,
        task: newTask,
        dueTime: feUtil.parseSecondsToDueTime(dueTime)
      }, _ => {
        feUtil.debugPrint(`Due Time is ${dueTime}`)
        window.changedTask = newTask.name
        window.taskActionVerb = "created new ";
        browserHistory.push(`/tasks/`)
      })

    }).catch(err => console.log(err))

  }

  handleDelete(e) {
    e.preventDefault();
    var deletedTask = this.state.task.name;
    var confirmation = window.confirm('Are you sure you want to delete this task?');
    if (confirmation) {
      console.log('Deleting task...');
      fetch(`/api/tasks/${this.state.task.name}`, {
        method: 'DELETE',
        credentials: 'include'
      }).then(res => {
        window.changedTask = deletedTask;
        window.taskActionVerb = "deleted ";
        browserHistory.push('/tasks')
      })
    }
  }

  handleSubmitEdit(e) {

    e.preventDefault();
    var editedTask = this.state.task.name;
    var dueDate = this.state.dueDate.startOf('day') / 1000;
    var dueTime = feUtil.parseDueTimeString(this.refs.dueTime.value);
    var deadline = dueDate + dueTime;

    var oldTaskValues = {
      name: this.state.task.name,
      estimate: this.state.task.estimate,
      deadline: this.state.task.deadline,
      timeWorked: this.state.task.timeWorked,
      reminderRequested: this.state.task.reminderRequested,
      description: this.state.task.description
    };

    // Set up defaults in case user clicls submit edit without inputing edits
    var estimateHours = Math.floor(this.state.task.estimate / (60 * 60));
    var estimateMinutes = Math.floor((this.state.task.estimate % (60 * 60)) / (60));

    if (this.refs.estimateHours.type === "number") {
        estimateHours = this.refs.estimateHours.value;
    }
    if (this.refs.estimateMinutes.type === "number") {
        estimateMinutes = this.refs.estimateMinutes.value;
    }

    var timeWorkedHours = Math.floor((this.state.task.timeWorked / (60 * 60)));
    var timeWorkedMinutes = Math.floor((this.state.task.timeWorked % (60 * 60)) / (60));

    if (this.refs.timeWorkedHours.type === "number") {
        timeWorkedHours = this.refs.timeWorkedHours.value;
    }
    if (this.refs.timeWorkedMinutes.type === "number") {
        timeWorkedMinutes = this.refs.timeWorkedMinutes.value;
    }

    var newTaskValues = {
      name: this.state.task.name,
      estimate: estimateHours * 60 * 60 + estimateMinutes * 60,
      gCalendarEventId: this.state.task.gCalendarEventId,
      deadline: deadline,
      timeWorked: timeWorkedHours * 60 * 60 + timeWorkedMinutes * 60,
      completed: this.state.task.completed,
      reminderRequested: this.refs.reminderRequested.checked,
      description: this.refs.description.value
    };

    var errMessage = feUtil.taskIsInvalidMessage(newTaskValues);
    if (errMessage) {
      alert(errMessage);
      return;
    }


    fetch(`/api/tasks/${oldTaskValues.name}`, {
      method: 'PUT',
      body: JSON.stringify(newTaskValues),
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    }).then(res => {
      this.setState({
        dueTime: this.refs.dueTime.value,
        dueDate: this.state.dueDate,
        editingTask: false,
        task: newTaskValues
      })
      window.changedTask = editedTask;
      window.taskActionVerb = "edited ";
      browserHistory.push('/tasks');
    }).catch(err => console.log(err))
    // Force this stuff to update brotato
    this.setState();
  }

  componentWillMount() {

    var task_id = this.props.params.task_id;
    feUtil.debugPrint('Task is mounting')

    if (task_id === 'new_task') {
      this.setState({
        new_task: true,
        loading: false
      })
      return;
    }

    fetch(`/api/tasks/${task_id}`, {
      method: "GET",
      credentials: 'include'
    }).then(res => {
      return res.json();
    }).then(json => {

      var dueDate = Moment.unix(json.deadline).startOf('day');
      var dueTime = json.deadline - dueDate / 1000;

      console.log(json);

      this.setState({
        task: json,
        loading: false,
        dueDate: dueDate,
        dueTime: feUtil.parseSecondsToDueTime(dueTime)

      })
    }).catch(err => console.log(err))


  }

  handleEdit(e) {
    this.setState({editingTask: true}, function () {
      this.render();
    })
  }

  render() {

    var reminderCount = undefined;
    var reminderTableRows = undefined;

    // console.log(this.state)


    if (this.state.loading) {
      return (
        <Main>
          <div className="container">
            <div className="jumbotron">
              <p className="text-center">Loading single task...</p>
            </div>
          </div>
        </Main>
      )
    }
    else if (this.state.new_task) {
      return (
        <Main>
          <div className={'container'}>

            <h2 className="text-center"> Create your Task!</h2>

            <form onSubmit={this.create}>


              <table align="center" className="table borderless">
                <tbody>
                <tr>
                  <th>Name</th>
                  <th>Due Time</th>
                  <th>Due Date</th>
                  <th>Estimate</th>

                </tr>
                <tr>
                  <td>
                    <input autoFocus={true} ref="taskName" type="text" placeholder="e.g. Meet with LaToza"/>
                  </td>
                  <td>
                    <select ref={"dueTime"} defaultValue={"5:00 AM"}>
                      {feUtil.availableDeadlinesJSX()}
                    </select>
                  </td>
                  <td className={"inline-block"}>
                    <DatePicker ref="deadlineDate"
                                selected={this.state.dueDate}
                                onChange={this.handleDatePickerChange}
                    />
                  </td>
                  <td>

                    <input ref="estimateHours"
                           title={"Hours"}
                           step={"any"}
                           min={0}
                           type="number" placeholder={"Hours"}/>

                    <input ref="estimateMinutes"
                           title={"Minutes"}
                           step={"any"}
                           min={0}
                           type="number" placeholder={"Minutes"}/>

                  </td>
                </tr>
                </tbody>
              </table>
              <div align={"center"}>
                            <textarea placeholder={"Add Description Here!"} ref={"description"} rows="4" cols="50">
                            </textarea>
              </div>
              <br/>
              <div align={"center"}>
                <label htmlFor="reminderRequested"> Send Reminder when Approaching Deadline</label>{` `}
                <input type="checkbox" name="reminderRequested" ref="reminderRequested" id="reminderRequested"/><br/>
              </div>
              <br/>
              <div align={"center"}>
                <button className="btn btn-primary" type="submit">Create Task</button>
              </div>
            </form>

          </div>
        </Main>
      )
    }
    else if (this.state.editingTask) {


        return (
            <Main>
                <div className={"container"}>
                    <h2 className="text-center"> Editing {this.state.task.name}</h2>
                    <form onSubmit={this.submitEdit}>
                        <table align="center" className={"table borderless"}>
                            <tbody>
                            <tr>
                                <th>Name</th>
                                <th>Due Time</th>
                                <th>Due Date</th>
                                <th>Estimate</th>
                                <th>Time Worked</th>
                            </tr>
                            <tr>
                                <td>{this.state.task.name}</td>
                                <td>
                                    <select autoFocus={true} ref={"dueTime"}
                                            defaultValue={this.state.dueTime}>
                                        {feUtil.availableDeadlinesJSX()}
                                    </select>
                                </td>
                                <td className={"inline-block"}>
                                    <DatePicker ref="dueDate"
                                                selected={this.state.dueDate}
                                                onChange={this.handleDatePickerChange}
                                    />
                                </td>
                                <td>
                                    <input className={"singleTaskTimeInput"} ref="estimateHours"
                                           title={"Hours"}
                                           onFocus={_ => {
                                               this.refs.estimateHours.type = "number";
                                               this.refs.estimateHours.value = Math.floor(this.state.task.estimate / (60 * 60));
                                           }}
                                           step={"any"}
                                           min={0}
                                           defaultValue={`${Math.floor(this.state.task.estimate / (60 * 60))}h`}
                                           type="text" placeholder={"Hours"}/>

                                    <input ref="estimateMinutes"
                                           className={"singleTaskTimeInput"}
                                           title={"Minutes"}
                                           onFocus={_ => {
                                               this.refs.estimateMinutes.type = "number";
                                               this.refs.estimateMinutes.value = Math.floor((this.state.task.estimate % (60 * 60)) / (60));
                                           }}
                                           step={"any"}
                                           defaultValue={`${Math.floor((this.state.task.estimate % (60 * 60)) / (60))}m`}
                                           min={0}
                                           type="text" placeholder={"Minutes"}/>

                                </td>
                                <td>
                                    <input ref="timeWorkedHours"

                                           title={"Hours Worked"}
                                           className={"singleTaskTimeInput"}
                                           onFocus={_ => {
                                               this.refs.timeWorkedHours.type = "number";
                                               this.refs.timeWorkedHours.value =
                                                   `${Math.floor((this.state.task.timeWorked / (60 * 60)))}`
                                           }}
                                           step={"any"}
                                           defaultValue={`${Math.floor(this.state.task.timeWorked / (60 * 60))}h`}
                                           min={0}
                                           type="text" placeholder={"Hours"}/>

                                    <input ref="timeWorkedMinutes"
                                           className={"singleTaskTimeInput"}
                                           title={"Minutes Worked"}
                                           onFocus={_ => {
                                               this.refs.timeWorkedMinutes.type = "number";
                                               this.refs.timeWorkedMinutes.value =
                                                   `${Math.floor((this.state.task.timeWorked % (60 * 60)) / (60))}`;
                                           }}
                                           step={"any"}
                                           defaultValue={`${Math.floor((this.state.task.timeWorked % (60 * 60)) / (60))}m`}
                                           min={0}
                                           type="text" placeholder={"Minutes"}/>
                                </td>
                            </tr>
                            </tbody>
                        </table>


                        <div className={"text-center"}>

                            <textarea
                                defaultValue={this.state.task.description} placeholder={"Add Description Here!"}
                                ref={"description"} rows="4" cols="50">
                            </textarea>
                        </div>
                        <div align={"center"}>
                            <label htmlFor="reminderRequested"> Send Reminder when Approaching Deadline</label>{` `}
                            <input type="checkbox" name="reminderRequested" ref="reminderRequested" id="reminderRequested"/><br/>
                        </div>
                        <br/>

                        <div className={"text-center"}>
                            <button className="btn btn-primary" type="submit">Submit Edit</button>
                        </div>
                    </form>
                </div>
            </Main>
        )
    }


      var taskCompleteButton = <button className={"glyphicon glyphicon-ok complete-task"} ref="finishTask"
                                       onClick={this.completeTask}> Complete</button>;
      if (this.state.task.completed) {
          taskCompleteButton = (<button className={"glyphicon glyphicon-collapse-up uncomplete-task"} ref="finishTask"
                                        onClick={this.completeTask}> Incomplete</button>)
      }

      var description = (
          <span className={"text-center"}>
            <h4>Description:</h4>
            <p>{this.state.task.description}</p>
            </span>
      );

      if (!this.state.task.description) {
          description = '';
      }

      return (
          <Main>
              <div className={"text-center container"}>
                  <h2 className="text-center"> Summary of {this.state.task.name}</h2>
                  <table align="center" className={"table borderless"}>
                      <tbody>
                      <tr>
                          <th>Name</th>
                          <th>Due Time</th>
                          <th>Due Date</th>
                          <th>Estimate</th>
                          <th>Time Worked</th>
                      </tr>
                      <tr>
                          <td>{this.state.task.name}</td>
                          <td>{this.state.dueTime}</td>
                          <td>{this.state.dueDate.format("MM/DD/YYYY")}</td>
                          <td>{feUtil.parseSecondsToEstimate(this.state.task.estimate)}</td>
                          <td>{feUtil.parseSecondsToEstimate(this.state.task.timeWorked)}</td>
                      </tr>
                      </tbody>
                  </table>

                  {description}

                  <b>Task Options</b>
                  <br/>
                  {taskCompleteButton}
                  <button className={"glyphicon glyphicon-pencil edit-task"} ref="editTask" onClick={this.edit}> Edit</button>
                  <button className={"glyphicon glyphicon-remove remove-task"} ref="deleteTask" onClick={this.delete}> Delete
                  </button>

              </div>
          </Main>
      );

  }
}

Task.propTypes = {};
export default Task;