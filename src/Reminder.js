var Reminder = class {

    constructor (task_id, owner, reminderTime, deadline) {

        this.task_id = task_id;
        this.owner = owner;
        this.reminderTime = reminderTime;
        this.deadline = deadline;
        this.sent = false;
    }

}

module.exports = Reminder;