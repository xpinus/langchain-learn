import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({
	model: "gpt-3.5-turbo",
	temperature: 0,
});

const stream = await model.stream("Hello! Tell me about yourself.");
const chunks = [];
for await (const chunk of stream) {
	chunks.push(chunk);
	process.stdout.write(`${chunk.content}`);
}
