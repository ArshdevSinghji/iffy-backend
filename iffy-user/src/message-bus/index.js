const amqp = require('amqplib');

class MessageBus {
    constructor(url, exchange) {
        this.url = url;
        this.exchange = exchange;
        this.connection = null;
        this.channel = null;
    }

    async connect() {
        if(!this.connection) {
            this.connection = await amqp.connect(this.url);
            this.channel = await this.connection.createChannel();
            await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
        }
    }
}

module.exports = { MessageBus };