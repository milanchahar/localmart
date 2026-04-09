let io = null;

const init = (server) => {
  const { Server } = require("socket.io");
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    socket.on("join_order", (orderId) => {
      socket.join(`order_${orderId}`);
    });

    socket.on("join_shop", (shopId) => {
      socket.join(`shop_${shopId}`);
    });

    socket.on("disconnect", () => {});
  });

  return io;
};

const get = () => io;

module.exports = { init, get };
