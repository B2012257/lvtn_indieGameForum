const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/site.router');
const { log } = require("debug");
const db = require("./models/index");
const route = require("./routes/index.js")
const passport = require('passport')
const session = require('express-session')
const app = express();
const hbsViewEngineConfig = require('./configs/hbsEngine')
const bodyParser = require('body-parser')
db.sequelize.sync()
  .then(() => {
    console.log("Synced db.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });


hbsViewEngineConfig(app)
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// Sử dụng middleware session
app.use(session({
  secret: '!xtera!123!',
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 86400000, sameSite: 'Lax' },
  // 1 ngày (đơn vị tính bằng mili giây)
}));

// Cấu hình Passport và sử dụng session
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('session'));


app.use(logger('dev'));


app.use(express.static(path.join(__dirname, 'public')));


route(app)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', {
    title: "Page not found",
    error_code: "404",
    error_msg: "Không tìm thấy trang.",
    header: true,
    user: req.user || req.session.user,
    errors: res.locals.error
  });
});

module.exports = app;
