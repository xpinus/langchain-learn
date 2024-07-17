import "dotenv/config";

import "cheerio"; // This is required in notebooks to use the `CheerioWebBaseLoader`
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { createRetrieverTool } from "langchain/tools/retriever";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";

import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { createToolCallingAgent } from "langchain/agents";
import { AgentExecutor } from "langchain/agents";

// 搜索工具
const search = new TavilySearchResults({
	maxResults: 2,
});

// 创建召回工具，能够从向量库中找到相关的文档
const loader = new CheerioWebBaseLoader(
	"https://docs.smith.langchain.com/overview"
);
const docs = await loader.load();
const splitter = new RecursiveCharacterTextSplitter({
	chunkSize: 1000,
	chunkOverlap: 200,
});
const documents = await splitter.splitDocuments(docs);
const vectorStore = await MemoryVectorStore.fromDocuments(
	documents,
	new OpenAIEmbeddings()
);
const retriever = vectorStore.asRetriever();

const retrieverTool = await createRetrieverTool(retriever, {
	name: "langsmith_search",
	description:
		"Search for information about LangSmith. For any questions about LangSmith, you must use this tool!",
});

const tools = [search, retrieverTool];

const prompt = ChatPromptTemplate.fromMessages([
	["system", "You are a helpful assistant"],
	["placeholder", "{chat_history}"],
	["human", "{input}"],
	["placeholder", "{agent_scratchpad}"],
]);

const model = new ChatOpenAI({ temperature: 0 });

const agent = await createToolCallingAgent({ llm: model, tools, prompt });

const agentExecutor = new AgentExecutor({
	agent,
	tools,
});

console.log(await agentExecutor.invoke({ input: "hi!" }));
console.log(
	await agentExecutor.invoke({ input: "how can langsmith help with testing?" })
);
console.log(
	await agentExecutor.invoke({ input: "whats the weather in nanjing?" })
);
