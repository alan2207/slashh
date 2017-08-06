const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let articleSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    tags: [],
    author: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    comments: [{
        author: String,
        content: String,
        date: String
    }]
});


let Article = mongoose.model('article', articleSchema);
module.exports = Article;