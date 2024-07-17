import { PromptTemplate } from "@langchain/core/prompts";

const promptTemplate = PromptTemplate.fromTemplate(
	"Tell me a joke about {topic}"
);

console.log(await promptTemplate.invoke({ topic: "cats" }));
