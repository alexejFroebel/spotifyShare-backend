const Router = require('koa-router');
const uuidv4 = require('uuid/v4');
const { User, Session } = require('../../database');
const server = require('../../server');
const assert = require('./util/assert');

const router = new Router();


router.get('/userid', async (ctx) => {
  const created = new Date();
  const userId = uuidv4();
  try {
    await new User({ userId, created }).save();
  } catch (err) {
    ctx.throw(500, err);
  }
  ctx.body = userId;
});
router.post('/session/create', async (ctx) => {
  const {
    userId, pin, sessionId, username,
  } = ctx.request.body;
  ctx.assert(userId, 400, 'no user id');
  ctx.assert(sessionId, 400, 'no session id');
  ctx.assert(username, 400, 'no username');
  assert.hasWsConnection(ctx, userId);
  await assert.validUser(ctx, userId);
  await assert.userHasNoSession(ctx, userId);
  await assert.sessionIsUnique(ctx, sessionId);
  const secret = uuidv4();
  try {
    const created = new Date();
    const members = {};
    members[userId] = username;
    const newSession = new Session({
      ownerUserId: userId, pin, sessionId, created, members, secret,
    });
    await newSession.save();
  } catch (err) {
    console.log(err);
  }
  server.sendClientMessage(userId, 'SESSION_SECRET', secret);
  ctx.body = 'success';
});
router.get('/', async (ctx) => {
  ctx.body = 'heyoo';
});
router.post('/session/join', async (ctx) => {
  const {
    userId, sessionId, pin, username,
  } = ctx.request.body;
  ctx.assert(userId, 400, 'no user id');
  ctx.assert(sessionId, 400, 'no session id');
  ctx.assert(username, 400, 'no username');
  assert.hasWsConnection(ctx, userId);
  await assert.validUser(ctx, userId);
  // FIXME user in session?
  let sessionToJoin;
  try {
    sessionToJoin = await Session.findOne({ sessionId });
  } catch (err) {
    return console.log(err);
  }
  if (!sessionToJoin) {
    ctx.throw(400, '9004');
  }
  const sessionPin = sessionToJoin.pin;
  if (!(sessionPin === pin)) {
    ctx.throw(400, '9005');
  }
  const sessionMembers = sessionToJoin.members;
  sessionMembers[userId] = username;
  sessionToJoin.markModified('members');
  try {
    await sessionToJoin.save();
  } catch (err) {
    return console.log(err);
  }
  const sessionSecret = sessionToJoin.secret;
  server.sendMessageToSession(sessionId, 'NEW_MEMBERS', sessionMembers);
  server.sendClientMessage(userId, 'SESSION_SECRET', sessionSecret);
  ctx.body = 'success';
});
router.post('/session/leave', async (ctx) => {
  const {
    userId, sessionId, secret,
  } = ctx.request.body;
  ctx.assert(userId, 400, 'no user id');
  ctx.assert(sessionId, 400, 'no session id');
  assert.hasWsConnection(ctx, userId);
  await assert.validUser(ctx, userId);
  // FIXME user in session?
  let sessionToLeave;
  try {
    sessionToLeave = await Session.findOne({ sessionId });
  } catch (err) {
    return console.log(err);
  }
  if (!sessionToLeave) {
    ctx.throw(400, '9004');
  }
  const sessionSecret = sessionToLeave.secret;
  if (sessionSecret !== secret) {
    ctx.throw(400, '9006');
  }
  const { ownerUserId } = sessionToLeave;
  if (ownerUserId === userId) {
    ctx.throw(400, '9007');
  }
  const sessionMembers = sessionToLeave.members;
  delete sessionMembers[userId];
  sessionToLeave.markModified('members');
  try {
    await sessionToLeave.save();
  } catch (err) {
    return console.log(err);
  }
  server.sendMessageToSession(sessionId, 'NEW_MEMBERS', sessionMembers);
  ctx.body = 'success';
});
/*
Errors:
9000 no ws connection established
9001 userid not found in database
9002 user already has session
9003 already session with id
9004 session does not exist
9005 invalid session pin
9006 invalid session secret
9007 owner cant leave
*/
module.exports = router;
