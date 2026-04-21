const { MessageBus } = require("..");

class Consumer extends MessageBus {
  async consume(routingKey, onMessage) {
    if (!this.channel) await this.connect();

    const q = await this.channel.assertQueue("chat_service_queue", {
      durable: true,
    });
    await this.channel.bindQueue(q.queue, this.exchange, routingKey);

    this.channel.consume(q.queue, (msg) => {
      if (msg !== null) {
        const messageContent = JSON.parse(msg.content.toString());
        onMessage(messageContent, msg.fields.routingKey);
        this.channel.ack(msg);
      }
    });

    console.log(
      `Waiting for messages in ${this.exchange} with routing key ${routingKey}`,
    );
  }
}

module.exports = { Consumer };
