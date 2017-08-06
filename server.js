const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const passport = require('passport');


const Article = require('./models/article');

mongoose.Promise = global.Promise;

//================================
//CONNECTING TO MONGODB
//================================

mongoose.connect(require('./config/database').database);
let db = mongoose.connection;

db.once('open', function() {
    console.log('Connected to MongoDB');
})

db.on('error', function(err) {
    console.log(err);
})

//=============================
//INITIALIZING THE APP
//=============================

const app = express();


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));


//===============================
//VALIDATION MIDDLEWARES
//===============================


app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}))


app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});


app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));


require('./config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session());



app.get('*', function(req, res, next) {
    res.locals.user = req.user || null;
    next();
});

//=================================
// ROUTES
//=================================


app.get('/', function(req, res) {
    Article.find({}, function(err, articles) {
        if(err) {
            console.log(err);
        }
        res.render('articles', {
            title: 'All Articles',
            articles: articles,
        });
    });
});

app.use('/articles', require('./routes/articles'));
app.use('/users', require('./routes/users'));

app.listen(process.env.PORT || 3000, function() {
    console.log('server started');
});