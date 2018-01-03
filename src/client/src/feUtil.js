
import React from 'react';

var thing = {


    debugPrint : function (arg) {
        console.log(`DEBUG:: ${arg}`)
    },

    parseSecondsToDueTime : function (secondsFromMidnight) {


        var hours = Math.floor(secondsFromMidnight/ (60 * 60));
        var minutes = `${Math.floor((secondsFromMidnight - (hours * 60 * 60)) / (60))}`;
        var suffix = (hours < 12) ? "AM" : "PM";
        hours = (hours <= 12) ? (hours) : (hours - 12);

        minutes = minutes.padStart(2, '0');

        return `${hours}:${minutes} ${suffix}`;
    },

    parseSecondsToEstimate : function (secondsNumber) {
        const secondsPerHour = 60 * 60;
        const secondsPerMinute = 60;

        var hours = Math.floor(secondsNumber/secondsPerHour);
        var minutes = Math.floor((secondsNumber - (secondsPerHour * hours)) / secondsPerMinute);

        var output = (hours) ? `${hours}h` : '';
        output = (minutes) ? `${output}${minutes}m`: output;
        output = (output === '') ? '0m' : output;

        return output;
    },
    
    taskIsInvalidMessage : function (task) {

        var regex = /^[^\$\.\#\\/\\[\]]+$/g;
        var noName = task.name.trim() === '';
        var notMatchingForm = !regex.exec(task.name);
        var noEstimate = !task.estimate;

        thing.debugPrint(`${task.deadline} ${task.estimate}`);

        if (noName) {
            return "Please give a name to the task."
        }

        else if (notMatchingForm) {
            return `Sorry, but "${task.name}" has characters we cannot use.\nPlease refrain from using "/", "\\", ".", "$", "#", "[", or "]" in your name.`
        }
        else if (noEstimate) {
            return "Please give an estimate for the task."
        }

        return false;

    },

    parseEstimateToSeconds : function (timeString) {
        // @assumes string is well structured
        timeString = timeString.toLocaleUpperCase();
        var regex = /(([0-9]*)H){0,1}(([0-9]*)M){0,1}/g;
        var match = regex.exec(timeString);


        thing.debugPrint(match);

        var hours = match[2] ? match[2] : 0;
        var minutes = match[4] ?  match[4] : 0;

        var seconds = (60 * minutes) + (60 * 60 * hours);
        return seconds;
    },
    
    parseDueTimeString : function (timeString) {

        const secondsPerHour = 60 * 60;
        const secondsPerMinute = 60;

        var regex = /([0-9]{1,2}):([0-9]{2})\s*([AP]M)/g;
        var match = regex.exec(timeString);

        var isMorning = match[3] === 'AM';
        var hour = isMorning ? Number.parseInt(match[1], 10) % 12 : Number.parseInt(match[1], 10) % 12 + 12;
        var minute = Number.parseInt(match[2]);

        var secondsFromMidnight = hour * secondsPerHour + minute * secondsPerMinute;
        return secondsFromMidnight;

    },

    availableDeadlinesJSX : function () {

        return (

            [
                <option value="5:00 AM">5:00 AM</option>,
                <option value="5:30 AM">5:30 AM</option>,

                <option value="6:00 AM">6:00 AM</option>,
                <option value="6:30 AM">6:30 AM</option>,

                <option value="7:00 AM">7:00 AM</option>,
                <option value="7:30 AM">7:30 AM</option>,

                <option value="8:00 AM">8:00 AM</option>,
                <option value="8:30 AM">8:30 AM</option>,

                <option value="9:00 AM">9:00 AM</option>,
                <option value="9:30 AM">9:30 AM</option>,

                <option value="10:00 AM">10:00 AM</option>,
                <option value="10:30 AM">10:30 AM</option>,

                <option value="11:00 AM">11:00 AM</option>,
                <option value="11:30 AM">11:30 AM</option>,

                <option value="12:00 PM">12:00 PM</option>,
                <option value="12:30 PM">12:30 PM</option>,

                <option value="1:00 PM">1:00 PM</option>,
                <option value="1:30 PM">1:30 PM</option>,

                <option value="2:00 PM">2:00 PM</option>,
                <option value="2:30 PM">2:30 PM</option>,

                <option value="3:00 PM">3:00 PM</option>,
                <option value="3:30 PM">3:30 PM</option>,

                <option value="4:00 PM">4:00 PM</option>,
                <option value="4:30 PM">4:30 PM</option>,

                <option value="5:00 PM">5:00 PM</option>,
                <option value="5:30 PM">5:30 PM</option>,

                <option value="6:00 PM">6:00 PM</option>,
                <option value="6:30 PM">6:30 PM</option>,

                <option value="7:00 PM">7:00 PM</option>,
                <option value="7:30 PM">7:30 PM</option>,

                <option value="8:00 PM">8:00 PM</option>,
                <option value="8:30 PM">8:30 PM</option>,

                <option value="9:00 PM">9:00 PM</option>,
                <option value="9:30 PM">9:30 PM</option>,

                <option value="10:00 PM">10:00 PM</option>,
                <option value="10:30 PM">10:30 PM</option>,

                <option value="11:00 PM">11:00 PM</option>,
                <option value="11:30 PM">11:30 PM</option>
            ]
        );

    }


}

export default thing;