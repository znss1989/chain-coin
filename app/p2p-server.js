const Websocket = require('ws');

// environment sample: HTTP_PORT=3002 P2P_PORT=5002 PEERS=ws://localhost:5001,ws://localhost:5002 npm run dev
const P2P_PORT = process.env.P2P_PORT || 5001;
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];
const MESSAGE_TYPES = {
  chain: 'CHAIN',
  transaction: 'TRANSACTION'
};

class P2pServer {
  constructor(blockchain, transactionPool) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.sockets = [];
  }

  listen() {
    const server = new Websocket.Server({
      port: P2P_PORT
    });
    server.on('connection', socket => {
      this.connectSocket(socket);
    });
    this.connectToPeers();
    console.log(`Listening for peer-to-peer connections on port: ${P2P_PORT}...`);
  }

  connectSocket(socket) {
    this.sockets.push(socket);
    console.log("Socket connected.");
    this.messageHandler(socket);
    this.sendChain(socket);
  }

  connectToPeers() {
    peers.forEach(peer => { // 'ws://localhost:5001'
      const socket = new Websocket(peer);
      socket.on('open', () => {
        this.connectSocket(socket);
      });
    });
  }

  messageHandler(socket) {
    socket.on('message', message => {
      const data = JSON.parse(message);
      this.blockchain.replaceChain(data);
    });
  }

  syncChains() {
    this.sockets.forEach(socket => {
      this.sendChain(socket);
    });
  }

  broadcastTransaction(transaction) {
    this.sockets.forEach(socket => {
      this.sendTransaction(socket, transaction);
    });
  }

  sendChain(socket) {
    socket.send(JSON.stringify({
      type: MESSAGE_TYPES.chain,
      chain: this.blockchain.chain
    }));
  }

  sendTransaction(socket, transaction) {
    socket.send(JSON.stringify({
      type: MESSAGE_TYPES.transaction,
      transaction
    }));
  }
}

module.exports = P2pServer;