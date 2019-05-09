const Router = require('koa-router');

const uuidv4 = require('uuid/v4');
const { User } = require('../../database');

const router = new Router();


router.get('/userid', async (ctx) => {
  const created = new Date();
  const userId = uuidv4();
  try {
    console.log('hallo');
    await new User({ userId, created }).save();
    console.log('hallo');
  } catch (err) {
    ctx.throw(500, err);
  }
  ctx.body = userId;
});
router.get('/', async (ctx) => {
  ctx.body = 'heyoo';
});

module.exports = router;
