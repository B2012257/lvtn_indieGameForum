
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
            trimString: function (str) {
                return str.trim();
            }
            ,
            vndFormat: function (amount) {
                var parts = parseFloat(amount).toFixed(2).toString().split('.');
                var integerPart = parts[0];
                var decimalPart = parts[1];

                // Tạo mảng các ký tự từ phần nguyên
                var integerArray = integerPart.split('').reverse();
                var formattedInteger = '';

                // Thêm dấu chấm phân cách hàng nghìn
                for (var i = 0; i < integerArray.length; i++) {
                    if (i % 3 === 0 && i !== 0) {
                        formattedInteger += '.';
                    }
                    formattedInteger += integerArray[i];
                }

                // Đảo ngược lại chuỗi phần nguyên để có định dạng đúng
                formattedInteger = formattedInteger.split('').reverse().join('');

                // Trả về chuỗi đã chuẩn hoá
                return formattedInteger + ' VND';
            },
        }
    }));
    app.set('view engine', '.hbs');
    app.set('views', './views');
}