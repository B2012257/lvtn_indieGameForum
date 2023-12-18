
const siteRouter = require("./site.router.js")
module.exports = (app) =>{
  app.use("/", siteRouter)
}
