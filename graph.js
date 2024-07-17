import "dotenv/config";

import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

import { ToolNode } from "@langchain/langgraph/prebuilt";
import { END, START, StateGraph, StateGraphArgs } from "@langchain/langgraph";
import { MemorySaver } from "@langchain/langgraph";

// Define the graph state
const graphState = {
	messages: {
		value: (x, y) => x.concat(y),
		default: () => [],
	},
};

// Define the tools
const searchTool = new DynamicStructuredTool({
	name: "search",
	description: "Call to surf the web.",
	schema: z.object({
		query: z.string().describe("The query to use in your search."),
	}),
	func: async ({ query }) => {
		// This is a placeholder for the actual implementation
		if (
			query.toLowerCase().includes("sf") ||
			query.toLowerCase().includes("san francisco")
		) {
			return "It's 60 degrees and foggy.";
		}
		return "It's 90 degrees and sunny.";
	},
});

const tools = [searchTool];
const toolNode = new ToolNode(tools);

const model = new ChatOpenAI({ temperature: 0 }).bindTools(tools);

// Define the function that determines whether to continue or not
function shouldContinue(state) {
	const messages = state.messages;
	const lastMessage = messages[messages.length - 1];

	// If the LLM makes a tool call, then we route to the "tools" node
	if (lastMessage.tool_calls?.length) {
		return "tools";
	}
	// Otherwise, we stop (reply to the user)
	return END;
}

// Define the function that calls the model
async function callModel(state) {
	const messages = state.messages;
	const response = await model.invoke(messages);

	// We return a list, because this will get added to the existing list
	return { messages: [response] };
}

// Define a new graph
const workflow = new StateGraph({ channels: graphState })
	.addNode("agent", callModel)
	.addNode("tools", toolNode)
	.addEdge(START, "agent") // 开始的节点
	.addConditionalEdges("agent", shouldContinue) // agent节点执行后判断接下来的执行
	.addEdge("tools", "agent"); // tools后执行agent

// Initialize memory to persist state between graph runs
const checkpointer = new MemorySaver();

// Finally, we compile it!
// This compiles it into a LangChain Runnable.
// Note that we're (optionally) passing the memory when compiling the graph
const app = workflow.compile({ checkpointer });

// Use the Runnable
const finalState = await app.invoke(
	{ messages: [new HumanMessage("what is the weather in sf")] },
	{ configurable: { thread_id: "42" } }
);
console.log(finalState.messages[finalState.messages.length - 1].content);
