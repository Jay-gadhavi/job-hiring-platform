const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
    }
  });

  io.on('connection', (socket) => {
    socket.on('join_room', (userId) => {
      if (userId) {
        const roomName = `user_${userId}`;
        socket.join(roomName);
      }
    });

    socket.on('join_job_chat', (jobId) => {
      if (jobId) {
        socket.join(`job_${jobId}`);
      }
    });

    socket.on('leave_job_chat', (jobId) => {
      if (jobId) {
        socket.leave(`job_${jobId}`);
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    console.warn('Socket.io instance requested before initialization');
    return null;
  }
  return io;
};

module.exports = { initSocket, getIO };
