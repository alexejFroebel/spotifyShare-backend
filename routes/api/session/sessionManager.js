const { User, Session } = require('../../../database');

async function checkIfUserIsInValidSession(userId, sessionId) {
  let session;
  try {
    session = await Session.findOne({ sessionId });
  } catch (err) {
    console.log(err);
  }
  if (!session) {
    return false;
  }
  const sessionMembers = session.members;
  const userIdsInSession = Object.keys(sessionMembers);
  if (userIdsInSession.includes(userId)) {
    return true;
  }
  return false;
}

async function checkAndUpdateUsersSession(ctx, userId, sessionId) {
  let user;
  try {
    user = await User.findOne({ userId });
  } catch (err) {
    console.log(err);
  }
  if (!user) {
    ctx.throw(400, '9001');
  }
  const currentSessionOfUser = user.currentSession;
  if (currentSessionOfUser) {
    const isUserInValidSession = await checkIfUserIsInValidSession(userId, currentSessionOfUser);
    if (isUserInValidSession) {
      ctx.throw(400, '9002');
    }
  }
  user.currentSession = sessionId;
  try {
    user.save();
  } catch (err) {
    console.log(err);
  }
}
module.exports.checkAndUpdateUsersSession = checkAndUpdateUsersSession;
module.exports.checkIfUserIsInValidSession = checkIfUserIsInValidSession;
