
const siteRouter = require("./site.router.js")
const passport = require('./passport')
const authRouter = require('./auth.route')
module.exports = (app) =>{

  app.use("/auth", authRouter)

  app.use("/oauth2", passport) //google oauth2
  app.use("/redirect", passport) //google redirect

  app.use("/", siteRouter)

}
