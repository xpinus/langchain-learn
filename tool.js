import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { tool } from "@langchain/core/tools";

const calculatorSchema = z.object({
	operation: z
		.enum(["add", "subtract", "multiply", "divide"])
		.describe("The type of operation to execute."),
	number1: z.number().describe("The first number to operate on."),
	number2: z.number().describe("The second number to operate on."),
});

const calculatorTool = tool(
	async ({ operation, number1, number2 }) => {
		// Functions must return strings
		if (operation === "add") {
			return `${number1 + number2}`;
		} else if (operation === "subtract") {
			return `${number1 - number2}`;
		} else if (operation === "multiply") {
			return `${number1 * number2}`;
		} else if (operation === "divide") {
			return `${number1 / number2}`;
		} else {
			throw new Error("Invalid operation.");
		}
	},
	{
		name: "calculator",
		description: "Can perform mathematical operations.",
		schema: calculatorSchema,
	}
);

const llm = new ChatOpenAI({
	model: "gpt-3.5-turbo",
	temperature: 0,
});

const llmWithTools = llm.bindTools([calculatorTool]);

const res = await llmWithTools.invoke("What is 3 * 12");

console.log(res.tool_calls);

// import { StructuredTool } from "@langchain/core/tools";
// import { z } from "zod";

// class Multiply extends StructuredTool {
//   schema = z.object({
//     first_int: z.number(),
//     second_int: z.number(),
//   });

//   name = "multiply";

//   description = "Multiply two integers together.";

//   async _call(input: z.infer<typeof this.schema>) {
//     return (input.first_int * input.second_int).toString();
//   }
// }

// const multiply = new Multiply();
