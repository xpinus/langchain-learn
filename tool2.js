import "dotenv/config";
import { StructuredTool } from "@langchain/core/tools";
import { z } from "zod";

import { renderTextDescription } from "langchain/tools/render";
import { ChatPromptTemplate } from "@langchain/core/prompts";

import { ChatOpenAI } from "@langchain/openai";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { RunnableLambda, RunnablePick } from "@langchain/core/runnables";

class Multiply extends StructuredTool {
	schema = z.object({
		first_int: z.number(),
		second_int: z.number(),
	});

	name = "multiply";

	description = "Multiply two integers together.";

	async _call(input) {
		return (input.first_int * input.second_int).toString();
	}
}

const multiply = new Multiply();

const renderedTools = renderTextDescription([multiply]); // 渲染出工具的文本描述

console.log(renderedTools);

const systemPrompt = `You are an assistant that has access to the following set of tools. Here are the names and descriptions for each tool:

{rendered_tools}

Given the user input, return the name and input of the tool to use. Return your response as a JSON blob with 'name' and 'arguments' keys.`;

const prompt = ChatPromptTemplate.fromMessages([
	["system", systemPrompt],
	["user", "{input}"],
]);

console.log(
	await prompt.invoke({
		input: "what's thirteen times 4",
		rendered_tools: renderedTools,
	})
);

const model = new ChatOpenAI({
	model: "gpt-3.5-turbo",
	temperature: 0,
});

const chain = prompt
	.pipe(model)
	.pipe(new JsonOutputParser())
	.pipe(new RunnablePick("arguments"))
	.pipe(
		new RunnableLambda({
			func: (input) =>
				multiply.invoke({
					first_int: input[0],
					second_int: input[1],
				}),
		})
	);

await chain.invoke({
	input: "what's thirteen times 4",
	rendered_tools: renderedTools,
});
