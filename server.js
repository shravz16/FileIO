import http from 'http';
import { Server } from 'socket.io';

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  }
});

io.on('connection', (socket) => {
  console.log('A user connected..');
  const fileBuffers = {};
  console.log(socket.handshake.query.room)
    socket.join(socket.handshake.query.room)
  socket.on('file-chunk', (data) => {
    if (!fileBuffers[data.fileName]) {
      fileBuffers[data.fileName] = [];
    }
    fileBuffers[data.fileName].push(data.chunk);
  });

  socket.on('file-complete', (data) => {
    const completeFile = Buffer.concat(fileBuffers[data.fileName].map(chunk => new Uint8Array(chunk)));
    console.log('File received:', data.fileName);

    
    const room = socket.handshake.query.room;
    
    fileBuffers[data.fileName].forEach(chunk => {
        
     var temp= socket.to(room).emit('file-receive', { chunk, fileName: data.fileName });
     
    });
    console.log(data.userName)
    socket.to(room).emit('file-receive', { complete: true, fileName: data.fileName,fileType:data.fileType,time:data.time,userName:data.userName });

    delete fileBuffers[data.fileName];
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
