// Upstash Redis-Backed Chat Memory

import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";
import {
	SystemMessage,
	HumanMessage,
	AIMessage,
} from "@langchain/core/messages";
import {
	ChatPromptTemplate,
	HumanMessagePromptTemplate,
	SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

import { Redis } from "ioredis";

const redis = new Redis({
	port: 6379,
	password: "97716",
});

// const msgs = [
// 	new HumanMessage({ content: "Hi! I'm Bob" }),
// 	new AIMessage({ content: "Hello Bob! How can I assist you today?" }),
// ];

// redis.rpush(
// 	"chat-memory",
// 	...msgs.map((item) => JSON.stringify(item.toDict()))
// );

let retrievedMessages = await redis.lrange("chat-memory", 0, -1);
retrievedMessages = retrievedMessages
	.map((item) => {
		const msg = JSON.parse(item);
		return msg.type + ": " + msg.data.content;
	})
	.join("\n");

// console.log(retrievedMessages);

const model = new ChatOpenAI({
	model: "gpt-3.5-turbo",
	temperature: 0,
});

const SYSTEM_TEMPLATE = `Answer the user's questions based on the below context.
If the context doesn't contain any relevant information to the question, don't make something up and just say "I don't know":

<context>
{memory}
</context>
`;

const prompt = ChatPromptTemplate.fromMessages([
	SystemMessagePromptTemplate.fromTemplate(SYSTEM_TEMPLATE),
	HumanMessagePromptTemplate.fromTemplate("{input}"),
]);

// console.log(
// 	await prompt.invoke({ input: "what's my name", memory: retrievedMessages })
// );

const chain = prompt.pipe(model).pipe(new StringOutputParser());

console.log("======== with memory =========");
console.log(
	await chain.invoke({
		input: "what's my name",
		memory: retrievedMessages,
	})
);

console.log("======== no memory =========");
console.log(
	await chain.invoke({
		input: "what's my name",
		memory: "",
	})
);

redis.disconnect();
