var Task = class {

    constructor (name, owner, estimate, deadline, reminderRequested, gcalendar = false) {

        this.name = name;
        this.owner = owner;
        this.estimate = estimate;
        this.deadline = deadline;
        this.reminderRequested = reminderRequested;
        this.reminderSent = false;
        this.reminderTime = JSON.stringify(new Date(new Date(deadline*1000).getTime() - estimate*1000));
        this.timeWorked = 0;
        this.description = '';
        this.completed = false;
    }
}

module.exports = Task;