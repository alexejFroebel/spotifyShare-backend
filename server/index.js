const connections = {};


function register(userid, connection) {
  connection.on('message', (message) => {
    console.log(`message from: ${userid}: ${message}`);
  });
  connection.on('error', (error) => {
    console.log(`Error: ${error} from ${userid}`);
  });
  connection.on('close', (e) => {
    console.log(`Connection closed${e}`);
    delete connections[userid];
  });
  connections[userid] = connection;
  connection.send("{ status: 'ok' }");
}

function hasWsConnection(userId) {
  if (connections[userId]) {
    return true;
  }
  return false;
}
module.exports.register = register;
module.exports.hasWsConnection = hasWsConnection;
