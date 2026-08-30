import React, { createContext, useContext, useEffect, useState } from 'react';
import { socket } from '../socket';

const SocketContext = createContext({
  socket: null,
  isConnected: false
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    const checkAndJoinRoom = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          const userId = parsed.id || parsed._id;
          if (userId) {
            socket.emit('join_room', userId);
          }
        } catch (err) {
          console.error('Error parsing stored user for socket:', err);
        }
      }
    };

    const onConnect = () => {
      setIsConnected(true);
      checkAndJoinRoom();
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    if (socket.connected) {
      onConnect();
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Listen for storage events in case user logs in/out in another tab
    window.addEventListener('storage', checkAndJoinRoom);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      window.removeEventListener('storage', checkAndJoinRoom);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
