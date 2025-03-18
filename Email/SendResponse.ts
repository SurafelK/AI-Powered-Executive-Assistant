import axios, { AxiosError } from 'axios';

export const getOpenAIResponse = async (subject: string, body: string) => {
  const apiKey = process.env.OPEN_AI_SECRET_KEY;

  if (!apiKey) {
    throw new Error("OPEN_AI_SECRET_KEY is not defined.");
  }

  const messages = [
    {
      role: 'system',
      content: 'You are a professional assistant.'
    },
    {
      role: 'user',
      content: `Subject: ${subject}\nBody: ${body}\n\nPlease provide a professional response to the message above.`
    }
  ];

  const maxRetries = 3; // Maximum retry attempts
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: messages,
          max_tokens: 200,
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const openAIResponse = response.data.choices[0].message.content;
      console.log("Response from OpenAI: ", openAIResponse);

      return openAIResponse;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 429) {
          console.warn(`Rate limit reached. Retry attempt: ${retries + 1}`);
          retries += 1;
          await new Promise(resolve => setTimeout(resolve, 1000 * retries)); // Exponential backoff
        } else {
          console.error("Error response from OpenAI:", error.response?.data);
        }
      } else if (error instanceof Error) {
        console.error("Error occurred:", error.message);
      } else {
        console.error("An unexpected error occurred:", error);
      }
      break; // Break the loop for other errors
    }
  }

  return "Sorry, there was an error generating a response. Please try again later.";
};
