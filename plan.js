import "dotenv/config";

import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

import { ChatPromptTemplate } from "@langchain/core/prompts";

import { END, START, StateGraph } from "@langchain/langgraph";

import { JsonOutputToolsParser } from "@langchain/core/output_parsers/openai_tools";

const planExecuteState = {
	input: {
		value: (left, right) => right ?? left ?? "",
	},
	plan: {
		value: (x, y) => y ?? x ?? [],
		default: () => [],
	},
	pastSteps: {
		value: (x, y) => x.concat(y),
		default: () => [],
	},
	response: {
		value: (x, y) => y ?? x,
		default: () => undefined,
	},
};

// Define Tools

const tools = [new TavilySearchResults({ maxResults: 3 })];

// Define our Execution Agent

const llm = new ChatOpenAI({
	temperature: 0,
});

const agentExecutor = createReactAgent({
	llm: llm,
	tools: tools,
});

// 根据问题生成计划
const plan = zodToJsonSchema(
	z.object({
		steps: z
			.array(z.string())
			.describe("different steps to follow, should be in sorted order"),
	})
);

const planFunction = {
	name: "plan",
	description: "This tool is used to plan the steps to follow",
	parameters: plan,
};

const planTool = {
	type: "function",
	function: planFunction,
};

const plannerPrompt = ChatPromptTemplate.fromTemplate(
	`For the given objective, come up with a simple step by step plan. \
This plan should involve individual tasks, that if executed correctly will yield the correct answer. Do not add any superfluous steps. \
The result of the final step should be the final answer. Make sure that each step has all the information needed - do not skip steps.

{objective}`
);

const model = new ChatOpenAI({
	modelName: "gpt-4-0125-preview",
}).withStructuredOutput(planFunction);

const planner = plannerPrompt.pipe(model);

const response = zodToJsonSchema(
	z.object({
		response: z.string().describe("Response to user."),
	})
);

const responseTool = {
	type: "function",
	function: {
		name: "response",
		description: "Response to user.",
		parameters: response,
	},
};

const replannerPrompt = ChatPromptTemplate.fromTemplate(
	`For the given objective, come up with a simple step by step plan. 
This plan should involve individual tasks, that if executed correctly will yield the correct answer. Do not add any superfluous steps.
The result of the final step should be the final answer. Make sure that each step has all the information needed - do not skip steps.

Your objective was this:
{input}

Your original plan was this:
{plan}

You have currently done the follow steps:
{pastSteps}

Update your plan accordingly. If no more steps are needed and you can return to the user, then respond with that and use the 'response' function.
Otherwise, fill out the plan.  
Only add steps to the plan that still NEED to be done. Do not return previously done steps as part of the plan.`
);

const replanner = replannerPrompt
	.pipe(new ChatOpenAI({ model: "gpt-4o" }).bindTools([planTool, responseTool]))
	.pipe(new JsonOutputToolsParser());

/* Nodes */
async function planStep(state) {
	const plan = await planner.invoke({ objective: state.input });
	return { plan: plan.steps };
}

async function executeStep(state, config) {
	const task = state.plan[0];
	const input = {
		messages: ["user", task],
	};
	const { messages } = await agentExecutor.invoke(input, config);

	return {
		pastSteps: [[task, messages[messages.length - 1].content.toString()]],
		plan: state.plan.slice(1),
	};
}

async function replanStep(state) {
	const output = await replanner.invoke({
		input: state.input,
		plan: state.plan.join("\n"),
		pastSteps: state.pastSteps
			.map(([step, result]) => `${step}: ${result}`)
			.join("\n"),
	});
	const toolCall = output[0];

	if (toolCall.type == "response") {
		return { response: toolCall.args?.response };
	}

	return { plan: toolCall.args?.steps };
}

/* Edge */
function shouldEnd(state) {
	return state.response ? "true" : "false";
}

const workflow = new StateGraph({
	channels: planExecuteState,
})
	.addNode("planner", planStep)
	.addNode("agent", executeStep)
	.addNode("replan", replanStep)
	.addEdge(START, "planner")
	.addEdge("planner", "agent")
	.addEdge("agent", "replan")
	.addConditionalEdges("replan", shouldEnd, {
		true: END,
		false: "agent",
	});

// Finally, we compile it!
// This compiles it into a LangChain Runnable,
// meaning you can use it as you would any other runnable
const app = workflow.compile();

const config = { recursionLimit: 50 };
const inputs = {
	input: "what is the hometown of the 2024 Australian open winner?",
};

for await (const event of await app.stream(inputs, config)) {
	console.log(event);
}
