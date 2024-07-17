import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

// import { getTextExtractor } from "office-text-extractor";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import { MemoryVectorStore } from "langchain/vectorstores/memory";
import weaviate from "weaviate-ts-client";
import { WeaviateStore } from "@langchain/weaviate";
import { OpenAIEmbeddings } from "@langchain/openai";

import { createRetrievalChain } from "langchain/chains/retrieval";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";

// 载入文件
const loader = new PDFLoader("./assets/hong.pdf");

const docs = await loader.load();

// console.log(docs.length);
// console.log(docs[0].pageContent.slice(0, 100));
// console.log(docs[0].metadata);

// 文本分割
const textSplitter = new RecursiveCharacterTextSplitter({
	chunkSize: 1000,
	chunkOverlap: 200,
});

const splits = await textSplitter.splitDocuments(docs.slice(5, 12));

// embedding
// const client = weaviate.client({
// 	scheme: process.env.WEAVIATE_SCHEME || "https",
// 	host:
// 		process.env.WEAVIATE_HOST ||
// 		"https://04e1rlblsamjsrcar8jvpg.c0.europe-west3.gcp.weaviate.cloud",
// 	apiKey: new weaviate.ApiKey(
// 		process.env.WEAVIATE_API_KEY || "JvVVoJV2fdE7l2QJQtk4nsrCP2nA9Cwjdyth"
// 	),
// });

// const response = await client.misc.readyChecker().do();

// const vectorStore = await WeaviateStore.fromDocuments(
// 	splits,
// 	new OpenAIEmbeddings(),
// 	{
// 		client,
// 		indexName: "Test",
// 		textKey: "text",
// 		metadataKeys: ["foo"],
// 	}
// );

// console.log(response);

const vectorstore = await MemoryVectorStore.fromDocuments(
	splits,
	new OpenAIEmbeddings()
);

const retriever = vectorstore.asRetriever();

const systemTemplate = [
	`You are an assistant for question-answering tasks. `,
	`Use the following pieces of retrieved context to answer `,
	`the question. If you don't know the answer, say that you `,
	`don't know. Use three sentences maximum and keep the `,
	`answer concise.`,
	`\n\n`,
	`{context}`,
].join("");

const prompt = ChatPromptTemplate.fromMessages([
	["system", systemTemplate],
	["human", "{input}"],
]);

const model = new ChatOpenAI({
	model: "gpt-3.5-turbo",
	temperature: 0,
});

const questionAnswerChain = await createStuffDocumentsChain({
	llm: model,
	prompt,
});
const ragChain = await createRetrievalChain({
	retriever,
	combineDocsChain: questionAnswerChain,
});

const results = await ragChain.invoke({
	input: "是谁指挥了七溪领战争?",
});

console.log(results);

// const messages = [
// 	new SystemMessage("Translate the following from English into Italian"),
// 	new HumanMessage("hi!"),
// ];

// const res = await model.invoke(messages);
// console.log("xxx", res);
