import "dotenv/config";

import {
	HumanMessage,
	SystemMessage,
	AIMessage,
	filterMessages,
} from "@langchain/core/messages";

const messages = [
	new SystemMessage({ content: "you are a good assistant", id: "1" }),
	new HumanMessage({ content: "example input", id: "2", name: "example_user" }),
	new AIMessage({
		content: "example output",
		id: "3",
		name: "example_assistant",
	}),
	new HumanMessage({ content: "real input", id: "4", name: "bob" }),
	new AIMessage({ content: "real output", id: "5", name: "alice" }),
];

console.log(
	filterMessages(messages, {
		includeTypes: ["human"],
		// excludeNames: ["example_user", "example_assistant"],
		// excludeIds: ["3"],
	})
);
