
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
                //convert to string to compare
                arg1 = arg1.toString();
                arg2 = arg2.toString();
                return (arg1.toUpperCase().trim() === arg2.toUpperCase().trim());
            },
            indexing: function (index) {
                return index + 1
            },
            json: function (context) {
                return JSON.stringify(context);
            },
        }
    }));
    app.set('view engine', '.hbs');
    app.set('views', './views');
}