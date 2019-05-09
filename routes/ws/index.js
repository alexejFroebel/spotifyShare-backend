
const Router = require('koa-router');
const server = require('../../server');

const router = new Router();


router.all('/subscribe/:userid', (ctx) => {
  const { userid } = ctx.params;
  ctx.assert(userid, 400, 'Userid needed');
  server.register(userid, ctx.websocket);
});
module.exports = router;
