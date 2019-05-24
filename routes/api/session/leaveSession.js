const { Session, User } = require('../../../database');
const server = require('../../../server');
const assert = require('../util/assert');

async function removeUser(userId) {
  try {
    const user = await User.findOne({ userId });
    server.closeConnection(userId);
    user.remove();
  } catch (err) {
    console.log(err);
  }
}
async function deleteSession(ctx, session, sessionId, token) {
  ctx.assert(token, 400, '9007');
  const sessionToken = session.token;
  console.log(token);
  console.log(sessionToken);
  if (token !== sessionToken) {
    ctx.throw(400, '9008');
  }
  const sessionMembers = session.members;
  const sessionMembersUserIds = Object.keys(sessionMembers);
  await server.sendMessageToSession(sessionId, 'REMOVED_FROM_SESSION', 'SESSION_DELETED');
  sessionMembersUserIds.forEach(((userId) => {
    removeUser(userId);
  }));
  try {
    await session.remove();
  } catch (err) {
    console.log(err);
  }
  ctx.body = 'success';
}
function leaveSession() {
  return async (ctx) => {
    const {
      userId, sessionId, secret, token,
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
      return deleteSession(ctx, sessionToLeave, sessionId, token);
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
    ctx.status = 200;
    removeUser(userId);
    return undefined;
  };
}
module.exports = leaveSession;
