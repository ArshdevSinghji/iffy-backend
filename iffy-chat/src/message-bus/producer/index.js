const { MessageBus } = require("..");

class Producer extends MessageBus {
  async publish(routingKey, message) {
    if (!this.channel) await this.connect();

    const messageBuffer = Buffer.from(JSON.stringify(message));
    console.log("messageBuffer ==> ", messageBuffer);
    this.channel.publish(this.exchange, routingKey, messageBuffer, {
      persistent: true,
    });

    console.log(
      `Message published to ${this.exchange} with routing key ${routingKey}`,
    );
  }
}

module.exports = { Producer };