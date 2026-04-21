const amqp = require("amqplib");

class MessageBus {
  constructor(url, exchange) {
    this.url = url;
    this.exchange = exchange;
    this.connection = null;
    this.channel = null;
  }

  async connect() {
    if (!this.connection) {
      this.connection = await amqp.connect(this.url);
      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange(this.exchange, "topic", {
        durable: true,
      });
    }
  }

  async close() {
    if (this.channel) {
      await this.channel.close();
      this.channel = null;
    }

    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }
  }
}

module.exports = { MessageBus };
