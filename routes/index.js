
const siteRouter = require("./site.router.js")
const passport = require('./passport')
const authRouter = require('./auth.route')
const userRouter = require('./user.route')
const authMiddleware = require('../middlewares/auth.middleware')

module.exports = (app) => {

  app.use("/auth", authRouter)

  app.use("/oauth2", passport) //google oauth2
  app.use("/redirect", passport) //google redirect
  app.use("/user", authMiddleware.isLogin, userRouter)
  app.use("/admin", authMiddleware.isLogin, authMiddleware.isAdmin, require("./admin.route.js"))
  // app.use("/api/v1", authMiddleware.isLogin, require("./api.route.js"))
  app.use("/api/v1", require("./api.route.js"))

  app.use("/", siteRouter)

}
