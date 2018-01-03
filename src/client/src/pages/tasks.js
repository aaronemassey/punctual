import React from 'react';
import Main from '../layouts/Main';
import TaskTable from '../components/TaskTable';

class Tasks extends React.Component {
  render() {
    return (
      <Main>
        <TaskTable />
      </Main>
    );
  }
}
Tasks.propTypes = {
  
};
export default Tasks;