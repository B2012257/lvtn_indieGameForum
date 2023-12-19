
const siteRouter = require("./site.router.js")
const passport = require('./passport')
module.exports = (app) =>{

  app.use("/auth", siteRouter)
  app.use("/oauth2", passport) //google oauth2

  app.use("/redirect", passport) //google redirect

  app.use("/", siteRouter)

}
