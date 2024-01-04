const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwtUtil = require('../utils/jwtUtil')
const db = require("../models/index")




// [POST] /user/register
const registerService = async (req, res) => {
    let usernameDb = await db.user.findOne({where: {username: req.body.username}})
    if (usernameDb) {
        return res.render("register", {msg: 'Username is already exists!'})
    }
    //Check password and retype password
    if (req.body.password === req.body['re-type-password']) {
        // try {
        //     const createdRole = await db.role.create({
        //         name: 'invalid_role_value' // Giả sử giá trị này không hợp lệ
        //     });
        //
        //     // Thực hiện các hành động sau khi tạo bản ghi thành công
        //     console.log('Role created successfully:', createdRole);
        // } catch (error) {
        //     // Bắt lỗi SequelizeValidationError và xử lý nó
        //     if (error instanceof db.Sequelize.ValidationError) {
        //         console.log(error.errors[0].message)
        //
        //         return res.render('error', { errors: error.errors[0] });
        //     } else {
        //         // Xử lý các loại lỗi khác
        //         console.error('Error:', error.message);
        //         return res.render('error', { errors: [error.message] });
        //     }
        // }
        let roleUser = await db.role.findOne({
            where: {name: "Admin"}
        })
        console.log(roleUser)
        await bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
            if (!err) {
                // console.log(hash);
                const newUser =
                    {
                        username: req.body.username,
                        password: hash,
                        email: req.body.email,
                        name: req.body.username,
                        roleId: roleUser.id
                    }

                db.user.create(newUser)
                    .then(user => {
                        // res.json(other)
                        return res.render('register', {user: user, msg: `Dang ky tai khoan ${user.name} thanh cong`})
                    })
                    .catch((error) => res.render('register', {msg: error}))
            } else return res.render('register', {msg: err})
        })
        // console.log(passwordHashed);
    } else res.render("register", {msg: "Mật khẩu không trùng khớp!"})

}
// [POST] /login/password
const loginService = async (req, res) => {
    const userDB = await db.user.findOne({where: {username: req.body.username}})
    const clientPassword = req.body.password
    if (userDB) {
        const checkPass = await bcrypt.compare(clientPassword, userDB.password).then(function (result) {
            return result;
        });
        // Dung mat khau -> cho phep dang nhap, tao 1 access token va 1 refresh token
        if (checkPass) {
            let accessToken = jwtUtil.generateToken(userDB.name, userDB.username)
            req.session.user = {
                name: userDB.name,
                email: userDB.email,
                token: accessToken
            }
            console.log(req.user)
            res.redirect(303, "/");
        }
        // Sai mat khau
        else {
            res.render("login", {msg: "Sai mat khau"})
        }
    }
    // Chưa đăng ký tài khoản
    else {
        res.render("login", {msg: "Ton khoan khong ton tai"})
    }
}
module.exports = {  loginService, registerService}