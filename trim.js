// All models have finite context windows, meaning there’s a limit to how many tokens they can take as input. If you have very long messages or a chain/agent that accumulates a long message is history, you’ll need to manage the length of the messages you’re passing in to the model.

import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";
import {
	AIMessage,
	HumanMessage,
	SystemMessage,
	trimMessages,
} from "@langchain/core/messages";

const model = new ChatOpenAI({ modelName: "gpt-3.5-turbo" });

const messages = [
	new SystemMessage("you're a good assistant, you always respond with a joke."),
	new HumanMessage("i wonder why it's called langchain"),
	new AIMessage(
		'Well, I guess they thought "WordRope" and "SentenceString" just didn\'t have the same ring to it!'
	),
	new HumanMessage("and who is harrison chasing anyways"),
	new AIMessage(
		"Hmmm let me think.\n\nWhy, he's probably chasing after the last cup of coffee in the office!"
	),
	new HumanMessage("what do you call a speechless parrot"),
];

const trimmed = await trimMessages(messages, {
	maxTokens: 45,
	strategy: "last", // first
	tokenCounter: model,
	includeSystem: true, // 不会过滤系统信息
	allowPartial: true, //  allow splitting up the contents of a message
	startOn: "human", //  make sure that our first message (excluding the system message)
});

console.log(
	trimmed
		.map((x) =>
			JSON.stringify(
				{
					role: x._getType(),
					content: x.content,
				},
				null,
				2
			)
		)
		.join("\n\n")
);
