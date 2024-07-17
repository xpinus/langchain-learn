import "dotenv/config";

import { ChatOpenAI } from "@langchain/openai";
import "cheerio";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import {
	ChatPromptTemplate,
	MessagesPlaceholder,
} from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { HumanMessage } from "@langchain/core/messages";

const llm = new ChatOpenAI({
	model: "gpt-3.5-turbo",
	temperature: 0,
});

// 加载分割文档
const loader = new CheerioWebBaseLoader(
	"https://docs.smith.langchain.com/user_guide"
);
const rawDocs = await loader.load();
const textSplitter = new RecursiveCharacterTextSplitter({
	chunkSize: 1000,
	chunkOverlap: 100,
});
const chunks = await textSplitter.splitDocuments(rawDocs);
const vectorStore = await MemoryVectorStore.fromDocuments(
	chunks,
	new OpenAIEmbeddings()
);

// 召回

const retriever = vectorStore.asRetriever();
const resultDocs = await retriever.invoke(
	"how can langsmith help with testing?"
);

// console.log(resultDocs);

// 问答+召回的内容

const SYSTEM_TEMPLATE = `Answer the user's questions based on the below context. 
If the context doesn't contain any relevant information to the question, don't make something up and just say "I don't know":

<context>
{context}
</context>
`;

const questionAnsweringPrompt = ChatPromptTemplate.fromMessages([
	["system", SYSTEM_TEMPLATE],
	new MessagesPlaceholder("messages"),
]);

const documentChain = await createStuffDocumentsChain({
	llm,
	prompt: questionAnsweringPrompt,
});

console.log(
	await documentChain.invoke({
		messages: [
			new HumanMessage("Can LangSmith help test my LLM applications?"),
		],
		context: resultDocs,
	})
);

console.log(
	await documentChain.invoke({
		messages: [
			new HumanMessage("Can LangSmith help test my LLM applications?"),
		],
		context: [],
	})
);
