const { Producer } = require("../../message-bus/producer");
const { interactionRepository, userRepository } = require("../../repositories");

async function likeService({ from, to, comment }) {
  try {
    const existingInteraction = await interactionRepository.findMatch(from, to);

    if (existingInteraction) {
      const partner_one = await userRepository.findById(from);
      const partner_two = await userRepository.findById(to);

      const match = new Producer(
        process.env.RABBIT_MQ_URL,
        process.env.RABBITMQ_TOPIC_EXCHANGE,
      );

      const message = {
        _id: existingInteraction._id,
        participants: {
          one: {
            _id: partner_one._id,
            name: partner_one.name,
            persona: partner_one.persona,
          },
          two: {
            _id: partner_two._id,
            name: partner_two.name,
            persona: partner_two.persona,
          },
        },
      };

      await match.publish("user.match.created", message);

      await existingInteraction.markAsMatch();
      return;
    }

    const payload = {
      from,
      to,
      type: "like",
      comment,
    };
    await interactionRepository.createInteraction(payload);
  } catch (error) {
    throw error;
  }
}

async function dislikeService({ from, dislikedIds }) {
  try {
    const payload = dislikedIds.map((to) => ({
      from,
      to,
      type: "dislike",
    }));
    await interactionRepository.bulkCreateInteraction(payload);
  } catch (error) {
    throw error;
  }
}

module.exports = {
  likeService,
  dislikeService,
};
