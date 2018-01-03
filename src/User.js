var User = class {

    constructor(userName, firstName, lastName, email) {

        this.username = userName;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.ownedTasks = {};
        // TODO add resolved and unResolved task maps
    }
}

module.exports = User;