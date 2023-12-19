const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { ValidationErrorItem}= require('sequelize')
const db = require("../models/index")
const {where} = require("sequelize");

//[GET] /
const getIndexPage = (req, res) => {
    if(!req.user) {
      return  res.redirect("/login")
    }
   return res.render("index", {user: req.user})
}

// [GET] /login
const getLoginPage = (req, res) => {
    res.render("login", {title: "Login page"})
}
// [GET] /register
const getRegisterPage = (req, res) => {
    res.render("register", {title: "Register page"})
}

// [POST] /user/register
const registerService = async (req,res) => {
    let usernameDb = await db.user.findOne({where: {username: req.body.username}})
    if(usernameDb) {
        return res.render("register", {msg: 'Username is already exists!'})
    }
    //Check password and retype password
    if (req.body.password === req.body['re-type-password']) {
        try {
            const createdRole = await db.role.create({
                name: 'invalid_role_value' // Giả sử giá trị này không hợp lệ
            });

            // Thực hiện các hành động sau khi tạo bản ghi thành công
            console.log('Role created successfully:', createdRole);
        } catch (error) {
            // Bắt lỗi SequelizeValidationError và xử lý nó
            if (error instanceof db.Sequelize.ValidationError) {
                console.log(error.errors[0].message)

                return res.render('error', { errors: error.errors[0] });
            } else {
                // Xử lý các loại lỗi khác
                console.error('Error:', error.message);
                return res.render('error', { errors: [error.message] });
            }
        }
        await bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
            if (!err) {
                // console.log(hash);
                const newUser =
                    {
                        username: req.body.username,
                        password: hash,
                        name:"ThaiPham",
                    }

                db.user.create(newUser)
                    .then(user => {
                        // res.json(other)
                       return res.render('index', {user: user})
                    })
                    .catch((error) => res.render('register', {msg: error}))
            }else return res.render('register', {msg: err})
        })
        // console.log(passwordHashed);
    } else res.render("register", {msg: "Mật khẩu không trùng khớp!"})

}
const loginService = async (req, res) => {
    const userDB = await db.user.findOne({where: {username: req.body.username}})
    const clientPassword = req.body.password
    if (userDB) {
        const checkPass = await bcrypt.compare(clientPassword, userDB.password).then(function (result) {
            return result;
        });
        // Dung mat khau -> cho phep dang nhap, tao 1 access token va 1 refresh token
        if (checkPass) {
            let accessToken =  jwt.sign(
                {
                    //Payload
                    name: userDB.name,
                    username: userDB.username
                },
                process.env.ACCESS_TOKEN_SCKEY,
                {
                    // Life Cycles of token
                    expiresIn: '1d'
                }

            )
            req.user = {}
            req.user.token = accessToken
            userDB.token = req.user.token
            res.render("index", {user: userDB})
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
module.exports = {getIndexPage,getLoginPage, loginService, getRegisterPage, registerService}