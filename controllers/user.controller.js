//[GET] /
const uploadProject = (req, res) => {
    console.log(req.body)
    console.log(req.user)

    // if (!req.user) {
    //     return res.redirect("/login")
    // }
    return res.send(req.body)
}

module.exports = {uploadProject}