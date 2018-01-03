import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';
import registerServiceWorker from './registerServiceWorker';
import './stylesheets/style.css';

import Index from './pages/index';
import Login from './pages/login';
import Signup from './pages/signup';
import Tasks from './pages/tasks';
import Error from './pages/error';
import Task from "./components/Task";
import PasswordReset from "./pages/passwordreset"

// Second to last route is due to a terible bugfix I need to investigate more when I have time and
// have brandon with me because he knows more about this sorta thing

ReactDOM.render((
    <Router history={browserHistory}>
        <Route path="/" component={Index}/>
        <Route path="/login" component={Login}/>
        <Route path="/signup" component={Signup}/>
        <Route path="/tasks" component={Tasks}/>
        <Route path="/tasks/:task_id" component={Task}/>
        <Route path="/api/enable_google_calendar" component={Index}/>
        <Route path="/forgot-password" component={PasswordReset}/>
        <Route path="*" component={Error}/>
    </Router>
), document.getElementById('root'));
registerServiceWorker();
