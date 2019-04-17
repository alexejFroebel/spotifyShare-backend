const Router = require('koa-router');

const router = new Router();



router.get("/userid", async (ctx) =>{
    
})
router.get("/", async (ctx) => {
    ctx.body = "heyoo"
})

module.exports = router