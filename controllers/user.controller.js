//[GET] /
const getCreateProjectPage = (req, res) => {
    console.log("req")
    console.log(req.user)

    // if (!req.user) {
    //     return res.redirect("/login")
    // }
    return res.send(req.params.id)
}

module.exports = {}