class WSSHClient {
  constructor() {
    this.connection = null;
  }

  _generateEndpoint() {
    let protocol = window.location.protocol === "https:" ? "wss://" : "ws://";
    return `${protocol}127.0.0.1:8080/webssh`;
  }

  connect(options) {
    const endpoint = this._generateEndpoint();

    if (window.WebSocket) {
      this.connection = new WebSocket(endpoint);
    } else {
      options.onError && options.onError("WebSocket Not Supported");
      return;
    }

    this.connection.onopen = () => {
      options.onConnect && options.onConnect();
    };

    this.connection.onmessage = (evt) => {
      const data = evt.data.toString();
      options.onData && options.onData(data);
    };

    this.connection.onclose = () => {
      options.onClose && options.onClose();
    };
  }

  send(data) {
    if (this.connection) {
      this.connection.send(JSON.stringify(data));
    }
  }

  sendInitData(options) {
    if (this.connection) {
      this.connection.send(JSON.stringify(options));
    }
  }

  sendClientData(data) {
    if (this.connection) {
      this.connection.send(
        JSON.stringify({ operate: "command", command: data })
      );
    }
  }
}

export default WSSHClient;
