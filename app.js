const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/site.router');
const {log} = require("debug");
const db = require("./models/index");
const route = require("./routes/index.js")
const passport = require('passport')
const session = require('express-session')
const app = express();
db.sequelize.sync()
    .then(() => {
      console.log("Synced db.");
    })
    .catch((err) => {
      console.log("Failed to sync db: " + err.message);
    });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Sử dụng middleware session
app.use(session({
    secret: '!xtera!123!',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 36000000 } // 1 giờ (đơn vị tính bằng mili giây)
}));

// Cấu hình Passport và sử dụng session
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('session'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


route(app)
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
// Middleware xử lý lỗi cho Sequelize
// Middleware xử lý lỗi cho Sequelize
app.use((err, req, res, next) => {
    if (err.name === 'SequelizeValidationError') {
        const errors = err.errors.map(e => e.message);
        res.render('error', { errors });
    } else {
        next(err);
    }
});


module.exports = app;
