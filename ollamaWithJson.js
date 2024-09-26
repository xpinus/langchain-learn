import "dotenv/config";
import { ChatOllama } from "@langchain/ollama";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const llm = new ChatOllama({
	model: "qwen2.5:7b", // Default value
	temperature: 0,
	maxRetries: 2,
	// other params...
});

// const llm = new ChatOpenAI({ temperature: 0 });

const formatInstructions = `   
Respond only in valid JSON. The JSON object you return should match the following schema:
{{ zh: "string", en: "string" }}

Where zh corresponding to the Chinese translation result, en corresponding to the English translation.
`;

const parser = new JsonOutputParser();

// Prompt
const prompt = PromptTemplate.fromTemplate(
	"How to say {input} in {output_language}:\n"
);

const chain = prompt.pipe(llm).pipe(parser);

const res = await chain.invoke({
	input: "gewerkschaft droht mit streiks bei vw", // 工会威胁要罢工大众
});

console.log(res, typeof res);
