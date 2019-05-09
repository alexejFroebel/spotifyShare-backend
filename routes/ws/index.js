
const Router = require('koa-router');

const router = new Router();
router.all('/hallo', (ctx) => {
  console.log('hello');
  ctx.websocket.send('Hello');
  ctx.websocket.on('message', (message) => {
    console.log(message);
  });
});

module.exports = router;
