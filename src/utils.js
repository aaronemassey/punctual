'use strict';

const google_auth_helper = require('./_google_auth_helper');

if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength,padString) {
        targetLength = targetLength>>0; //floor if number or convert non-number to 0;
        padString = String(padString || ' ');
        if (this.length > targetLength) {
            return String(this);
        }
        else {
            targetLength = targetLength-this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
            }
            return padString.slice(0,targetLength) + String(this);
        }
    };
}


module.exports = {
    // Class #1
    User : class {
        constructor (username, firstName, lastName, password, gradYear, major) {
            this.username = username;
            this.firstName = firstName;
            this.lastName = lastName;
            this.password = password;
            this.gradYear = gradYear;
            this.major = major;
        }

        toFBKeyPair() {
            return {'username': this.username, 'firstName': this.firstName,
            'lastName': this.lastName, 'password': this.password, 'gradYear': this.gradYear, 'major': this.major};
        }

    },

    updateEventCalendar(calendar, token, task, callback) {

        var date = new Date(task.deadline * 1000);
        console.log(task);

        let hoursStr = `${date.getHours()}`;
        hoursStr = hoursStr.padStart(2, '0');

        let minutesStr = `${date.getMinutes()}`;
        minutesStr = minutesStr.padStart(2, '0') + ':00-05:00';

        let dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

        var dateTimeStr = `${dateStr}T${hoursStr}:${minutesStr}`;

        console.log(dateTimeStr)

        var event = {
            'summary': `${task.name}`,
            'description': `${task.description}`,
            'start': {
                'dateTime': dateTimeStr,
            },
            'end': {
                'dateTime': dateTimeStr,
            }
        };

        google_auth_helper.OAuthClient.setCredentials({
            refresh_token: token.refresh_token,
            access_token: token.access_token
        });

        calendar.events.update({
            auth: google_auth_helper.OAuthClient,
            calendarId: 'primary',
            eventId: task.gCalendarEventId,
            resource: event
        }, function(err, event) {
            if (err) {
                console.log('There was an error contacting the Calendar service: ' + err);
                return;
            }
            task.gCalendarEventId = event.id;
            console.log('Event created: %s', event.htmlLink);
            if (callback) {
                callback(task);
            }
        });
    },

    deleteEventCalendar(calendar, token, task, callback) {

        google_auth_helper.OAuthClient.setCredentials({
            refresh_token: token.refresh_token,
            access_token: token.access_token
        });

        console.log(task)
        calendar.events.delete({
            auth: google_auth_helper.OAuthClient,
            calendarId: 'primary',
            eventId: task.gCalendarEventId,
        }, function(err, event) {
            console.log(err)
            if (err && (err.code != 410)) {
                console.log('There was an error contacting the Calendar service: ' + err);
                return;
            }
            console.log('Event deleted: %s', task.name);
            if (callback) {
                callback(task);
            }
        });
    },

    postEventCalendar(calendar, token, task, callback) {

        var date = new Date(task.deadline * 1000);
        console.log(task);

        let hoursStr = String(`${date.getHours()}`);
        hoursStr = hoursStr.padStart(2, '0');

        let minutesStr = `${date.getMinutes()}`;
        minutesStr = minutesStr.padStart(2, '0') + ':00-05:00';

        let dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

        var dateTimeStr = `${dateStr}T${hoursStr}:${minutesStr}`;

        console.log(dateTimeStr)

        var event = {
            'summary': `${task.name}`,
            'description': `${task.description}`,
            'start': {
                'dateTime': dateTimeStr,
            },
            'end': {
                'dateTime': dateTimeStr,
            }
        };

        google_auth_helper.OAuthClient.setCredentials({
            refresh_token: token.refresh_token,
            access_token: token.access_token
        });

        calendar.events.insert({
            auth: google_auth_helper.OAuthClient,
            calendarId: 'primary',
            resource: event,
        }, function(err, event) {
            if (err) {
                console.log('There was an error contacting the Calendar service: ' + err);
                return;
            }
            task.gCalendarEventId = event.id;
            console.log('Event created: %s', event.htmlLink);
            if (callback) {
                callback(task);
            }
        });

    }


}