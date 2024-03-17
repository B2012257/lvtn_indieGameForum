const isLogin = (req, res, next) => {
    let user = req.user || req.session.user
    console.log("User", user);
    if (user) {
        next()
    } else {
        res.redirect("/login")
    }
}
module.exports = {
    isLogin
}