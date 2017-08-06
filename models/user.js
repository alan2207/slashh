const mongoose = require('mongoose');
const Schema = mongoose.Schema();


const UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});


const User = mongoose.model('user', UserSchema);

module.exports = User;