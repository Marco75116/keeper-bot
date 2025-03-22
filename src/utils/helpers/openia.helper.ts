import { openaiClient } from "../clients/openai.client";
import { MODEL_AI, systemInstructions } from "../constants/global.constant";

export const getMessageOpenAI = (messageUser: string) => {
  return [
    {
      role: "system",
      content: systemInstructions,
    },
    {
      role: "user",
      content: messageUser,
    },
  ];
};

export const getOpenAIResponse = async (messageUser: string) => {
  const messages = getMessageOpenAI(messageUser);

  const responseOpenai = await openaiClient.chat.completions.create({
    model: MODEL_AI,
    messages: messages as never,
    temperature: 0.9,
    max_tokens: 150,
    frequency_penalty: 0.5,
  });

  return responseOpenai.choices[0].message.content;
};
