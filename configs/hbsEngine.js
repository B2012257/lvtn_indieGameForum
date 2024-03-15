
const handlebars = require('express-handlebars')
const moment = require('moment');
const helperMoment = require('helper-moment');
module.exports = (app) => {
    moment.locale('vi');

    app.engine('.hbs', handlebars.engine({
        extname: '.hbs',
        helpers: {
            moment: function (date, format) {
                return moment(date).format(format);
            }
        }
    }));
    app.set('view engine', '.hbs');
    app.set('views', './views');
}