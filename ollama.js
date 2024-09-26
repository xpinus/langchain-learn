import { ChatOllama } from "@langchain/ollama";
import { PromptTemplate } from "@langchain/core/prompts";

const llm = new ChatOllama({
	model: "qwen2:0.5b", // Default value
	temperature: 0,
	maxRetries: 2,
	// other params...
});

const prompt = PromptTemplate.fromTemplate(
	"How to say {input} in {output_language}:\n"
);

const chain = prompt.pipe(llm);

const completion = await chain.invoke({
	output_language: "German",
	input: "I love programming.",
});

console.log(completion);
