const express = require('express');
const router = express.Router();
const marked = require('marked');
const moment = require('moment');


const Article = require('../models/article');



router.get('/add', ensureAuthenticated, function(req, res) {
    
    res.render('add_article', {
        title: 'Add Article'
    })
});


router.get('/myarticles', ensureAuthenticated, function(req, res) {
    
    Article.find({author: req.user.username})
        .then((articles) => {
            res.render('articles', {
                articles: articles,
                title: 'My Articles'
            });
        });
});


// searching route by title substring:
router.post('/search', function(req, res) {
    var term = req.body.term.toLowerCase();
    
    var regex = new RegExp(term,"gi");

    
    Article.find({title: {$regex: regex}})
            .then((articles) => {
                    res.render('articles', {
                    articles: articles,
                    title: 'Search results for: ' + term
                })
            })
})

// searching route by tag name:
router.get('/tag/search/:tag', function(req, res) {
    var tag = req.params.tag;

    Article.find({tags: {$in: [tag]}})
            .then((articles) => {
                res.render('articles', {
                    articles: articles,
                    title: 'Search results for ' + tag + ' tag'
                })
            })
})




router.get('/:id', function(req, res) {
    Article.findById(req.params.id)
    .then((article) => {
        res.render('article', {article: article});
    })
});


router.post('/add', function(req, res) {
    req.checkBody('title', 'Title is required').notEmpty();
    req.checkBody('body', 'Content is required').notEmpty();

    let errors = req.validationErrors();

    if(errors) {
        res.render('add_article', {
            title: 'Add Article',
            errors: errors
        })
    } else {
        
        const article = new Article({
            title: req.body.title,
            tags: req.body.tags.split(',').map((tag) => tag.toLowerCase()),
            author: req.user.username,
            body: marked(req.body.body, {sanitize: true}),
            date: moment().format('MMMM Do YYYY, h:mm:ss a')
        });
        article.save()
        .then(() => {
            req.flash('success', 'Article created successfully!');
            res.redirect('/');
        })
        .catch((err) => {
            req.flash('error', 'Failed to add the article!')
            res.redirect('/articles/add');
        })
    }
})



router.get('/edit/:id', ensureAuthenticated, function(req, res) {
    Article.findById(req.params.id)
    .then((article) => {
        if(article.author !== req.user.username) {
            req.flash('error', 'Not Authorized!');
            res.redirect('/');
        } else {
            res.render('edit_article', {article: article});
        }
        
    }).catch(err => console.log(err))
});



router.post('/edit/:id', function(req, res) {
    var article = {
        title: req.body.title,
        body: req.body.body
    }
    Article.findByIdAndUpdate(req.params.id, article)
    .then((article) => {
        req.flash('success', 'Article edited successfully!');
        res.redirect('/');
    })
    .catch(() => {
        req.flash('error', 'Article could not be modified!');
        res.redirect('/edit/'+req.params._id)
    });
});



router.delete('/:id', function(req, res) {
    if(!req.user._id) {
        res.status(500).send();
    }

    Article.findById(req.params.id)
        .then(article => {
            if(article.author !== req.user.username) {
                res.status(500).send();
            } else {
                Article.findByIdAndRemove(req.params.id)
                    .then(() => {
                        req.flash('error', 'Article successfully deleted!');
                        res.send('Success');
                    })
                    .catch(() => {
                        req.flash('error', 'Article could not be deleted!');
                        console.log('Error occured during deleting.');
                    });
            }
        })

});

// route for adding comments
router.post('/addcomment/:id', function(req, res) {
    var comment = {
        author: req.user.username,
        content: marked(req.body.body, {sanitize: true}),
        date: moment().format('MMMM Do YYYY, h:mm:ss a')
    }

    Article.update({_id: req.params.id},{$push: {comments: comment}})
        .then(() => {
            req.flash('error', 'comment added successfully');
            res.redirect('/articles/' + req.params.id);
        })
        .catch(err => {
            req.flash('error', 'failed to add comment');
            res.redirect('/articles/' + req.params.id);
        });
});


function ensureAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    } else {
        req.flash('error', 'Please, log in!');
        res.redirect('/users/login');
    }
}


module.exports = router;