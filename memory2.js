// Upstash Redis-Backed Chat Memory

import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";
import {
	SystemMessage,
	HumanMessage,
	AIMessage,
} from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
	ChatPromptTemplate,
	MessagesPlaceholder,
} from "@langchain/core/prompts";

import { Redis } from "ioredis";

import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { BaseChatMessageHistory } from "@langchain/core/chat_history";

class RedisChatMessageHistory extends BaseChatMessageHistory {
	lc_namespace = ["langchain", "stores", "message", "ioredis"];

	constructor({ sessionId }) {
		super();
		this.redis = new Redis({
			port: 6379,
			password: "97716",
		});

		this.sessionId = sessionId;
	}

	async getMessages() {
		let retrievedMessages = await this.redis.lrange(this.sessionId, 0, -1);
		retrievedMessages = retrievedMessages.map((item) => {
			const msg = JSON.parse(item);
			// return msg.type + ": " + msg.data.content;
			switch (msg.type) {
				case "human":
					return new HumanMessage(msg.data.content);
				case "ai":
					return new AIMessage(msg.data.content);
				default:
					break;
			}
		});

		return retrievedMessages;
	}

	//  abstract getMessages(): Promise<BaseMessage[]>;
	//  abstract addMessage(message: BaseMessage): Promise<void>;
	//  abstract addUserMessage(message: string): Promise<void>;
	//  abstract addAIChatMessage(message: string): Promise<void>;
	//  /**
	// 	* Add a list of messages.
	// 	*
	// 	* Implementations should override this method to handle bulk addition of messages
	// 	* in an efficient manner to avoid unnecessary round-trips to the underlying store.
	// 	*
	// 	* @param messages - A list of BaseMessage objects to store.
	// 	*/
	//  addMessages(messages: BaseMessage[]): Promise<void>;
	//  abstract clear(): Promise<void>;
}

const prompt = ChatPromptTemplate.fromMessages([
	["system", "You're an assistant."],
	new MessagesPlaceholder("memory"),
	["human", "{question}"],
]);

const model = new ChatOpenAI({ temperature: 0 });

const chain = prompt.pipe(model);

const chainWithHistory = new RunnableWithMessageHistory({
	runnable: chain,
	getMessageHistory: (sessionId) =>
		new RedisChatMessageHistory({
			sessionId,
		}),
	inputMessagesKey: "question",
	historyMessagesKey: "memory",
});

const result = await chainWithHistory.invoke(
	{
		question: "what's my name?",
	},
	{
		configurable: {
			sessionId: "chat-memory",
		},
	}
);

console.log(result);
