const { chatRepository } = require("../../repositories");
const { encryptChatText, decryptChatText } = require("../../utils/chat-crypto");

const getChats = async (payload) => {
  const { roomId } = payload.params;
  const { limit = 10, page = 1 } = payload.query;
  let criteria = {};

  criteria.room_id = roomId;

  criteria.limit = parseInt(limit);
  criteria.skip = (parseInt(page) - 1) * parseInt(limit);

  const result = await chatRepository.findChats(criteria);

  const chats = (result[0]?.chats || []).map((chat) => ({
    ...chat,
    text: decryptChatText(chat.text),
  }));
  const total = result[0]?.total?.length > 0 ? result[0].total[0].count : 0;

  return {
    chats,
    total,
  };
};

const getChatById = async (chatId) => {
  const chat = await chatRepository.findChatById(chatId);

  if (chat) {
    chat.text = decryptChatText(chat.text);
  }

  return chat;
};

const createChatMessage = async (room_id, sender_id, text) => {
  const encryptedText = encryptChatText(text);
  const chat = await chatRepository.createChat({
    room_id,
    sender_id,
    text: encryptedText,
  });

  if (chat) {
    chat.text = text;
  }

  return chat;
};

const getLatestMessage = async (room_id) => {
  const chat = await chatRepository.findLatestMessage(room_id);

  if (chat) {
    chat.text = decryptChatText(chat.text);
  }

  return chat;
};

module.exports = {
  getChats,
  getChatById,
  createChatMessage,
  getLatestMessage,
};
