import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";

import {
	JsonOutputParser,
	StringOutputParser,
} from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const model = new ChatOpenAI({
	model: "gpt-3.5-turbo",
	temperature: 0,
});

const QUESTION_ROUTER_SYSTEM_TEMPLATE = `
You are an expert at routing user question to different agents.

each agent consists of  name and description. For example:

[test] (this is a test agent)

[] is the name of the agent, and () is the description of the agent.

Here are the optional proxies:

[vectorstore](The agent for answering and user-related information)
[websearch](When the question is related to real-time information or needs to be searched on the internet)
[unkonw](If there are no other suitable agent, select the agent)

Give a choice agent's name based on the question, returning JSON with a single key "route" and no preamble or description.`;

const questionRouterPrompt = ChatPromptTemplate.fromMessages([
	["system", QUESTION_ROUTER_SYSTEM_TEMPLATE],
	["human", "{question}"],
]);

// const chain = questionRouterPrompt.pipe(model).pipe(new JsonOutputParser());
const chain = model.pipe(new StringOutputParser());

// console.log(await chain.invoke({ question: "南京在哪" }));
console.log(await chain.invoke("南京今天最高温度"));
