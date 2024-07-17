import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";

import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";

import { RunnableLambda, RunnableSequence } from "@langchain/core/runnables";

const model = new ChatOpenAI({
	model: "gpt-3.5-turbo",
	temperature: 0,
});

const prompt = ChatPromptTemplate.fromTemplate("tell me a joke about {topic}");

const chain = prompt.pipe(model).pipe(new StringOutputParser());

// const analysisPrompt = ChatPromptTemplate.fromTemplate(
// 	"is this a funny joke? {joke}"
// );

// const composedChain = new RunnableLambda({
// 	func: async (input) => {
// 		const result = await chain.invoke(input);
// 		return { joke: result };
// 	},
// })
// 	.pipe(analysisPrompt)
// 	.pipe(model)
// 	.pipe(new StringOutputParser());

// const composedChainWithLambda = RunnableSequence.from([
//   chain,
//   (input) => ({ joke: input }),
//   analysisPrompt,
//   model,
//   new StringOutputParser(),
// ]);

console.log(await chain.invoke({ topic: "bears" }));
