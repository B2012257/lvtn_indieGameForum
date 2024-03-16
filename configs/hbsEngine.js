
const handlebars = require('express-handlebars')
const moment = require('moment');
module.exports = (app) => {
    moment.locale('vi');

    app.engine('.hbs', handlebars.engine({
        extname: '.hbs',
        helpers: {
            momentDay: function (date) {
                return moment(date).format("L");
            },
            momentTime: function (date) {
                return moment(date).format("LLL");
            },
            ifEquals: function (arg1, arg2) {
                return (arg1 === arg2);
            },
            indexing: function (index) {
                return index + 1
            }
        }
    }));
    app.set('view engine', '.hbs');
    app.set('views', './views');
}