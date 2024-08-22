import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { pull } from "langchain/hub";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

const tools = [new TavilySearchResults({ maxResults: 3 })];

// Get the prompt to use - you can modify this!
// If you want to see the prompt in full, you can at:
// https://smith.langchain.com/hub/hwchase17/react
const prompt = await pull("hwchase17/react");

const llm = new ChatOpenAI({
	temperature: 0,
});

const agent = await createReactAgent({
	llm,
	tools,
	// prompt,
});

const agentExecutor = new AgentExecutor({
	agent,
	tools,
});

const result = await agentExecutor.invoke({
	message: "what is LangChain?",
});

console.log(result);
