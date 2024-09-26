import "dotenv/config";
import { ChatOllama } from "@langchain/ollama";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";

const model = new ChatOllama({
	model: "qwen2.5:7b", // Default value
	temperature: 0,
	maxRetries: 2,
	// other params...
});

const translation = z.object({
	zh: z.string().describe("corresponding to the Chinese translation result"),
	en: z.string().describe("corresponding to the English translation"),
});

const structuredLlm = model.withStructuredOutput(translation);

const prompt = PromptTemplate.fromTemplate(
	"Please translate {input} to Chinese and English:\n"
);

const chain = prompt.pipe(structuredLlm);

const res = await chain.invoke({
	input: "gewerkschaft droht mit streiks bei vw", // 工会威胁要罢工大众
});

console.log(res);
