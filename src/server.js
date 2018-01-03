// 'use strict';

// React
// import React from 'react';
// import ReactDOM from 'react-dom';
// import './index.css';
// var React = require('react');  
// var ReactDOM = require('react-dom');
// var jsx = require('react-jsx');

// Inner Stuff
const _google_auth_helper = require('./_google_auth_helper');
const utils = require('./utils.js');
const Task = require('./Task');
const User = require('./User');
const Reminder = require('./Reminder');
const globals = require('./globals')

// Outside stuff
//var sessionCookie = require('express-session');
const cookieParser = require('cookie-parser');
const express = require('express');
const path = require('path');
const os = require('os');
const bodyParser = require('body-parser');
var firebase = require('firebase');
var fs = require('fs');
var cors = require('cors');

// Read in firebase credentials
let firebase_credentials_filepath = path.join(__dirname, '../','api_credentials', 'firebase_key.json');
var fileJSONCredentials = fs.readFileSync(firebase_credentials_filepath);
var parsedJSONCredentials = JSON.parse(fileJSONCredentials);


// Initialize Firebase
var config = {
    apiKey: parsedJSONCredentials.apiKey,
    authDomain: "bbui-amassey.firebaseapp.com",
    databaseURL: "https://bbui-amassey.firebaseio.com",
    projectId: "bbui-amassey",
    storageBucket: "bbui-amassey.appspot.com",
    messagingSenderId: "856611317817"
};
//Google Calendar API
var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var calendar = google.calendar('v3');
firebase.initializeApp(config);

var main = function () {

    // Setup the server
    const server = express();
    const port = process.env.PORT || 5000;
    server.use(bodyParser.json());
    server.use(cookieParser());
    server.use(express.static(__dirname + '/client/build'));
    server.use(cors());

    const database = firebase.database();

    const nodemailer = require('nodemailer');

    // should consider this putting this in a different file
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        secure: true,
        port: 465,
        transportMethod: 'SMTP',
        auth: {
            user: 'noreply.punctual@gmail.com',
            pass: 'buimassey'
        }
    });
    function sendReminderEmail(email, task_id, deadline, reminderTime){
        console.log(deadline);
        console.log(reminderTime);
        let deadlineDate = new Date(deadline)
        let url = 'https://bbui-amassey.herokuapp.com/'
        let val = (deadline - reminderTime) / 60000; // divided by 1000 to get to seconds, then 60 to get to minutes
        let mailOptions = {
            from: 'Punctual <no-reply@punctual.com>',
            to: email,
            subject: `Punctual: Reminder for ${task_id}`,
            text: `This e-mail has been automatically sent to remind you about \"${task_id}\", which has passed ${val} minutes before its deadline at ${deadlineDate}.\n\nPlease finish or update this task on the website!\n\nRegards,\n\nThe Punctual Team\n${url}`,
            html: '<h1>Punctual</h1>This e-mail has been automatically sent to remind you about ' + task_id + ', which has passed ' +
            val + ' minutes before its deadline at ' + deadlineDate + '.<br><br>Please finish or update this task on the website!<br><br>Regards,<br><br>The Punctual Team<br>' + url
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if(error){
                console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
        });
    }

    server.post('/api/password-reset', (req, res) => {
        var email = req.body['email'];
        firebase.auth().sendPasswordResetEmail(email).then(function() {
            console.log(email);
            res.status(200).send({message: 'The reset e-mail has been sent! Please check your e-mail to reset your password.'});
        }).catch(function(error){
            var errorCode = error.code;
            console.log(error);
            console.log(errorCode);
            if(errorCode === 'auth/user-not-found'){
                res.status(401).send({message: 'This e-mail address does not exist. Please enter a correct e-mail.'})
            }
            else {
                res.status(500).send({message: 'There was an error sending the password reset e-mail. Please try again.'});
            }
        })
    });



    server.post('/api/enable_google_calendar', (req, res) => {

        // If no oauth code given, grab oauth code from google calendar
        // and have client post to us again
        console.log('was called')

        var origin = 'https://bbui-amassey.herokuapp.com/';
        if (!process.env.PORT) {
            origin = 'http://localhost:3000';
        }

        res.cookie("uid", req.cookies.uid, {httpOnly:false});
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Credentials','true');

        res.json(JSON.stringify({redirectUrl :_google_auth_helper.OAuth2TokenGetURI}));
    });


    server.get('/api/enable_google_calendar', (req, res) => {

        console.log('Cookies below');
        console.log(req.cookies);
        var uid = req.cookies.uid;
        console.log('Enable gogole calendar get =' +  uid);
        var redirectURL = 'http://localhost:3000';
        if (process.env.PORT) {
            redirectURL = '/';
        }
        var oauth2Code = req.param('code');
        _google_auth_helper.OAuthClient.getToken(oauth2Code, function (err, tokens) {

            console.log('Here in heroku')
            database.ref(`users/${uid}/gCalendarToken`)
                .set(tokens)
                .then(_ => res.redirect(redirectURL))
                .catch(err => res.send('err'));
        });
    });

    setInterval(_ => {
        database.ref('users/').once('value')
            .then(function (val) {
                let snapshot = val.val();
                // console.log(snapshot);
                for (let u in snapshot) {
                    let taskData = snapshot[u]['tasks'];
                    for (let tasks in taskData) {
                        let task = taskData[tasks];
                        if (task != null && !task.completed && task.reminderRequested && !task.reminderSent ){
                            let reminderTime = Date.parse(JSON.parse(task.reminderTime));
                            let deadline = JSON.parse(task['deadline'])*1000;
                            if(new Date().getTime() >= reminderTime) {
                                sendReminderEmail(snapshot[u]['email'], task.name, deadline, reminderTime);
                                task.reminderSent = true;
                                database.ref(`users/${u}/tasks/${task.name}`).set(task);
                            }
                        }
                    }
                }
            })
            .catch(err => console.log(err));
    }, 60 * 1000);


    server.get('/api/userInfo', (req, res) => {
        var user_id = req.cookies.uid;
        res.header('Access-Control-Allow-Credentials','true');
        database.ref(`users/${user_id}`)
            .once('value')
            .then(val => res.send(val))
            .catch (err => res.send(`${err}`));

    });

    server.get('/api/tasks/', (req, res) => {
        res.header('Access-Control-Allow-Credentials','true');
        var user_id = req.cookies.uid;
        console.log('Cookie is ' + JSON.stringify(req.cookies))
        if(user_id){
            var params = req.params;

            // res.sendFile(__dirname + '/tasks.html');


            database.ref(`users/${user_id}/tasks/`)
                .once('value')
                .then(val => res.send(val))
                .catch (err => res.send(`${err}`));
        }
        else{
            res.send("User not logged in");
            // res.redirect('/login');
        }

    });


    server.get('/api/tasks/:task_id', (req, res) => {
        var uid = req.cookies.uid;
        res.header('Access-Control-Allow-Credentials','true');
        if(uid){
            var params = req.params;
            var user_id = uid;
            var task_id = params['task_id'];

            database.ref(`users/${user_id}/tasks/${task_id}`)
                .once('value')
                .then(val => {
                    console.log(val)
                    res.send(val)
                })
                .catch (err => {

                    console.log("there was err")
                    res.send(`err`)

                });
        }
        else{
            console.log("wasnt logged in")
            res.send("User not logged in");
        }

    });

    server.put('/api/tasks/:task_id', (req, res) => {
        var uid = req.cookies.uid;
        if(uid){
            var params = req.params;
            var json_body = req.body;

            var user_id = uid;
            var task_id = params['task_id'];
            var owner = user_id;
            var estimate = json_body['estimate'];
            var minutesWorked = json_body['timeWorked'];
            var gCalendarEventId = json_body['gCalendarEventId'];
            var deadline = json_body['deadline']; // currently in seconds
            var description = json_body['description'] || '';
            var completed = json_body['completed'];
            var reminderRequested = json_body['reminderRequested'];

            var edited_task = new Task(task_id, owner, estimate, deadline, reminderRequested);
            edited_task.timeWorked = minutesWorked;
            edited_task.description = description;
            edited_task.gCalendarEventId = gCalendarEventId || null;
            edited_task.completed = (true == completed);
            edited_task.reminderSent = json_body['reminderSent'] || false;
            database.ref(`users/${user_id}/tasks/${edited_task.name}`)
                .set(edited_task)
                .then(_ => res.send('Edited task!'))
                .catch(err => res.send(`err`));

            database.ref(`users/${user_id}/gCalendarToken`)
                .once('value', tokenRef => {

                    if(tokenRef.val()) {

                        if (edited_task.completed) {
                            utils.deleteEventCalendar(calendar, tokenRef.val(), edited_task)
                        }
                        else {
                            utils.updateEventCalendar(calendar, tokenRef.val(), edited_task);
                        }
                    }

                })
                .catch(err => console.log(err))


        }
        else{
            res.send("User not logged in");
        }
    });


    server.delete('/api/tasks/:task_id', (req, res) => {
        var uid = req.cookies.uid;
        if(uid) {
            console.log('called')
            var params = req.params;

            var user_id = uid;
            var task_id = params['task_id'];


            var deleteFromFB = task => {
                database.ref(`users/${user_id}/tasks/${task_id}`)
                    .remove()
                    .then(_ => res.send(`Deleted ${task_id}!`))
                    .catch(err => res.send(`err`));
            }

            database.ref(`users/${user_id}/gCalendarToken`)
            // Get gcalendar token
                .once('value', tokenRef => {
                    if (tokenRef.val()) {
                        // Get task to delete if applicable for gcalendarEventID
                        database.ref(`users/${user_id}/tasks/${task_id}`)
                            .once('value', taskRef => {
                                utils.deleteEventCalendar(calendar, tokenRef.val(), taskRef.val(), deleteFromFB);
                            })
                    }
                    else {
                        database.ref(`users/${user_id}/tasks/${task_id}`)
                            .remove()
                            .then(_ => res.send(`Deleted ${task_id}!`))
                            .catch(err => res.send(`err`));
                    }
                })

        }
        else{
            res.send("User not logged in");
        }
    });

    // Reminders need testing
    server.post('/api/tasks/:task_id', (req, res) => {
        var uid = req.cookies.uid;
        if(uid) {
            var params = req.params;
            var json_body = req.body;

            var user_id = uid;
            var task_id = params['task_id'];
            var owner = user_id;
            var estimate = json_body['estimate']; // seconds
            var description = json_body['description'];
            var deadline = json_body['deadline']; // currently in seconds
            var reminderRequested = json_body['reminderRequested'];
            var new_task = new Task(task_id, owner, estimate, deadline, reminderRequested);
            new_task.description = description;

            var pushToFB = task => {
                database.ref(`users/${task.owner}/tasks/${task.name}`)
                    .set(task)
                    .then(_ => res.send('Created new task!'))
                    .catch(err => res.send(`err`));
            };

            database.ref(`users/${user_id}/gCalendarToken`)
                .once('value', token => {

                    var gCalenderEventID = undefined;
                    if (token.val()) {
                        gCalenderEventID = utils.postEventCalendar(calendar, token.val(), new_task, pushToFB);
                    }
                    else {
                        pushToFB(new_task)
                    }
                })
                .catch(err => res.send('err'));


        }
        else{
            res.send("User not logged in");
        }

    });

    server.post('/api/login', (req, res) => {

        var origin = 'https://bbui-amassey.herokuapp.com/';
        if (!process.env.PORT) {
            origin = 'http://localhost:3000';
        }

        firebase.auth().signInWithEmailAndPassword(req.body['email'], req.body['password'])
            .then(function (json) {
                console.log("successful login");
                res.cookie("uid", json['uid'], {httpOnly:false});
                res.header('Access-Control-Allow-Origin', origin);
                res.header('Access-Control-Allow-Credentials','true');
                res.send(`${os.hostname()}`);
                firebase.auth().signOut();
            })
            .catch(function(error) {
                // Handle Errors here.
                var errorCode = error.code;
                console.log('failed login');
                console.log(errorCode);
                var errorMessage = error.message;
                // res.send(errorMessage);
                if(errorCode === 'auth/wrong-password' || errorCode === 'auth/user-not-found'){
                    console.log('Incorrect e-mail or password. Please try again.');
                    res.status(401).send({error: 'Incorrect e-mail or password. Please try again.'});
                }
                else{
                    console.log('The server cannot log you in at this time. Please try another time');
                    res.status(500).send({error: 'The server cannot log you in at this time. Please try another time.'});
                }

            });
    });

    // User registering an account
    server.post('/api/signup', (req, res) => {
        var origin = 'https://bbui-amassey.herokuapp.com/';
        if (!process.env.PORT) {
            origin = 'http://localhost:3000';
        }
        firebase.auth().createUserWithEmailAndPassword(req.body['email'], req.body['password'])
            .then(function() {
                firebase.auth().signInWithEmailAndPassword(req.body['email'], req.body['password'])
                    .then(function () {
                        let newUid = firebase.auth().currentUser.uid;
                        database.ref(`users/${newUid}`).set({username: req.body['username'], email: req.body['email'], uid: newUid});
                        console.log("successful login");
                        res.cookie("uid", newUid, {httpOnly:false});
                        res.header('Access-Control-Allow-Origin', origin);
                        res.header('Access-Control-Allow-Credentials','true');
                        res.send("set");
                        firebase.auth().signOut();
                    })
            })
            .catch(function (error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                console.log(errorCode);
                if(errorCode === 'auth/email-already-in-use'){
                    console.log('This e-mail already exists. Please use a different e-mail.');
                    res.status(401).send({error: 'This e-mail already exists. Please use a different e-mail.'});
                }
                else if (errorCode === 'auth/weak-password') {
                    res.status(403).send({error: 'This password is too weak. Please use a password with at least 6 characters.'});
                }
                else{
                    console.log('The server cannot create this account at this time. Please try another time');
                    res.status(500).send({error: 'The server cannot create this account at this time. Please try another time.'});
                }
                // console.log(errorMessage);
                // res.send(errorMessage);
            });
    });

    server.post('/api/logout', (req, res) => {
        firebase.auth().signOut().then(function() {
            res.clearCookie("uid");
            res.send("Signout successful");
        }).catch(function(error) {
            // An error happened.
            res.send(error.message)
        });
    });

    server.get('*', function (req, res){
        res.sendFile(__dirname+'/client/build/index.html');
    });


    server.listen(port);
    console.log(`Backend server is currently listening on port ${port}`);

}

module.exports = main;

if (require.main === module) {
    main();
}
