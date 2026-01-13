const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');

let io = null;

function parseTokenFromHandshake(handshake) {
  try {
    const cookieHeader = handshake.headers?.cookie;
    if (!cookieHeader) return null;
    const cookies = cookie.parse(cookieHeader || '');
    return cookies.token || null;
  } catch (e) {
    return null;
  }
}

function init(server, options = {}) {
  if (io) return io;
  io = new Server(server, {
    cors: {
      origin: options.corsOrigin || ['http://localhost:3000', process.env.FRONTEND_URL],
      credentials: true
    }
  });

  io.on('connection', async (socket) => {
    try {
      const token = parseTokenFromHandshake(socket.handshake);
      if (!token) {
        return;
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded && decoded.id) {
        const userId = decoded.id.toString();
        socket.join(userId);
        socket.userId = userId;
      }
    } catch (err) {
      console.log(err);
    }

    socket.on('disconnect', () => {});
  });

  return io;
}

function getIO() {
  return io;
}

module.exports = { init, getIO };