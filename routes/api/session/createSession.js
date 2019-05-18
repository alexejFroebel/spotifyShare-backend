const uuidv4 = require('uuid/v4');
const { Session } = require('../../../database');
const server = require('../../../server');
const assert = require('../util/assert');
const sessionManager = require('./sessionManager');

function createSession() {
  return async function createNewSession(ctx) {
    const {
      userId, pin, sessionId, username, tokenInfo,
    } = ctx.request.body;
    ctx.assert(userId, 400, 'no user id');
    ctx.assert(sessionId, 400, 'no session id');
    ctx.assert(username, 400, 'no username');
    ctx.assert(tokenInfo, 400, 'no tokenInfo');
    assert.hasWsConnection(ctx, userId);
    await assert.sessionIsUnique(ctx, sessionId);
    await sessionManager.checkAndUpdateUsersSession(ctx, userId, sessionId);
    const secret = uuidv4();
    try {
      const created = new Date();
      const members = {};
      members[userId] = username;
      const newSession = new Session({
        ownerUserId: userId, pin, sessionId, created, members, secret, tokenInfo,
      });
      await newSession.save();
    } catch (err) {
      console.log(err);
    }
    server.sendClientMessage(userId, 'SESSION_SECRET', secret);
    ctx.body = 'success';
  };
}

module.exports = createSession;
