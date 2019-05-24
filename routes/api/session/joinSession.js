const { Session } = require('../../../database');
const server = require('../../../server');
const assert = require('../util/assert');
const sessionManager = require('./sessionManager');

function joinSession() {
  return async (ctx) => {
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
    await sessionManager.checkAndUpdateUsersSession(ctx, userId, sessionId);
    const sessionMembers = sessionToJoin.members;
    sessionMembers[userId] = username;
    sessionToJoin.markModified('members');
    try {
      await sessionToJoin.save();
    } catch (err) {
      return console.log(err);
    }
    const sessionSecret = sessionToJoin.secret;
    const owner = sessionToJoin.ownerUserId;
    server.sendMessageToSession(sessionId, 'NEW_MEMBERS', sessionMembers);
    server.sendClientMessage(userId, 'SESSION_SECRET', sessionSecret);
    ctx.body = { owner };
    return undefined;
  };
}

module.exports = joinSession;
