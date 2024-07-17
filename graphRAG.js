import "dotenv/config";

import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";

import { createRetrieverTool } from "langchain/tools/retriever";

import { ToolExecutor } from "@langchain/langgraph/prebuilt";
import { END, START } from "@langchain/langgraph";
import { MessageGraph } from "@langchain/langgraph";

import { pull } from "langchain/hub";

import {
  AIMessage,
  HumanMessage,
	FunctionMessage,
} from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { convertToOpenAIFunction } from "@langchain/core/utils/function_calling";

import { zodToJsonSchema } from "zod-to-json-schema";
import { z } from "zod";

// Retriever
const urls = [
	"https://lilianweng.github.io/posts/2023-06-23-agent/",
	"https://lilianweng.github.io/posts/2023-03-15-prompt-engineering/",
	"https://lilianweng.github.io/posts/2023-10-25-adv-attack-llm/",
];

const docs = await Promise.all(
	urls.map((url) => new CheerioWebBaseLoader(url).load())
);
const docsList = docs.flat();

const textSplitter = new RecursiveCharacterTextSplitter({
	chunkSize: 1000,
	chunkOverlap: 100,
});
const docSplits = await textSplitter.splitDocuments(docsList);

// Add to vectorDB
const vectorStore = await MemoryVectorStore.fromDocuments(
	docSplits,
	new OpenAIEmbeddings()
);

const retriever = vectorStore.asRetriever();

const tool = createRetrieverTool(retriever, {
	name: "retrieve_blog_posts",
	description:
		"Search and return information about Lilian Weng blog posts on LLM agents, prompt engineering, and adversarial attacks on LLMs.",
});
const tools = [tool];

const toolExecutor = new ToolExecutor({
	tools,
});

/**
 * Decides whether the agent should retrieve more information or end the process.
 * This function checks the last message in the state for a function call. If a function call is present, the process continues to retrieve information. Otherwise, it ends the process.
 * @param state - The current state of the agent, including all messages.
 * @returns {string} - A decision to either "continue" the retrieval process or "end" it.
 */
function shouldRetrieve(state) {
	console.log("---DECIDE TO RETRIEVE---");
	const lastMessage = state[state.length - 1];
	// If there is no function call then we finish.
	if (!lastMessage.additional_kwargs.function_call) {
		console.log("---DECISION: DO NOT RETRIEVE / DONE---");
		return END;
	}
	console.log("---DECISION: RETRIEVE---");
	return "retrieve";
}


/**
 * Determines whether the Agent should continue based on the relevance of retrieved documents.
 * This function checks if the last message in the conversation is of type FunctionMessage, indicating
 * that document retrieval has been performed. It then evaluates the relevance of these documents to the user's
 * initial question using a predefined model and output parser. If the documents are relevant, the conversation
 * is considered complete. Otherwise, the retrieval process is continued.
 * @param {Array<BaseMessage>} state - The current state of the agent, including all messages.
 * @param {RunnableConfig | undefined} config - The configuration for the runnable.
 * @returns {Array<BaseMessage>} - The updated state with the new message added to the list of messages.
 */
async function gradeDocuments(state) {
  console.log("---GET RELEVANCE---");
  // Output
  const output = zodToJsonSchema(z.object({
    binaryScore: z.string().describe("Relevance score 'yes' or 'no'"),
  }));
  const tool = {
    type: "function",
    function: {
      name: "give_relevance_score",
      description: "Give a relevance score to the retrieved documents.",
      parameters: output,
    },
  };

  const prompt = ChatPromptTemplate.fromTemplate(
    `You are a grader assessing relevance of retrieved docs to a user question.
  Here are the retrieved docs:
  \n ------- \n
  {context} 
  \n ------- \n
  Here is the user question: {question}
  If the content of the docs are relevant to the users question, score them as relevant.
  Give a binary score 'yes' or 'no' score to indicate whether the docs are relevant to the question.
  Yes: The docs are relevant to the question.
  No: The docs are not relevant to the question.`,
  );

  const model = new ChatOpenAI({
    modelName: "gpt-4-0125-preview",
    temperature: 0,
  }).bind({
    tools: [tool],
    tool_choice: tool,
  });

  const chain = prompt.pipe(model);

  const lastMessage = state[state.length - 1];

  const score = await chain.invoke({
    question: state[0].content as string,
    context: lastMessage.content as string,
  });

  return [score];
}

/**
 * Check the relevance of the previous LLM tool call.
 *
 * @param {Array<BaseMessage>} state - The current state of the agent, including all messages.
 * @returns {string} - A directive to either "yes" or "no" based on the relevance of the documents.
 */
function checkRelevance(state) {
  console.log("---CHECK RELEVANCE---");
  const lastMessage = state[state.length - 1];
  const toolCalls = lastMessage.additional_kwargs.tool_calls;
  if (!toolCalls) {
    throw new Error("Last message was not a function message");
  }
  const parsedArgs = JSON.parse(toolCalls[0].function.arguments);

  if (parsedArgs.binaryScore === "yes") {
    console.log("---DECISION: DOCS RELEVANT---");
    return "yes";
  }
  console.log("---DECISION: DOCS NOT RELEVANT---");
  return "no";
}

// Node

/**
 * Invokes the agent model to generate a response based on the current state.
 * This function calls the agent model to generate a response to the current conversation state.
 * The response is added to the state's messages.
 * @param {Array<BaseMessage>} state - The current state of the agent, including all messages.
 * @param {RunnableConfig | undefined} config - The configuration for the runnable.
 * @returns {Array<BaseMessage>} - The updated state with the new message added to the list of messages.
 */
async function agent(state) {
  console.log("---CALL AGENT---");
  const functions = tools.map((tool) => convertToOpenAIFunction(tool));
  const model = new ChatOpenAI({
    modelName: "gpt-4-0125-preview",
    temperature: 0,
    streaming: true,
  }).bind({
    functions,
  });

  const response = await model.invoke(state);
  // We can return just the response because it will be appended to the state.
  return [response];
}

/**
 * Executes a tool based on the last message's function call.
 * This function is responsible for executing a tool invocation based on the function call
 * specified in the last message. The result from the tool execution is added to the conversation
 * state as a new message.
 * @param {Array<BaseMessage>} state - The current state of the agent, including all messages.
 * @param {RunnableConfig | undefined} config - The configuration for the runnable.
 * @returns {Array<BaseMessage>} - The updated state with the new message added to the list of messages.
 */
async function retrieve(state) {
  console.log("---EXECUTE RETRIEVAL---");
  // Based on the continue condition
  // we know the last message involves a function call.
  const lastMessage = state[state.length - 1];
  const action = {
    tool: lastMessage.additional_kwargs.function_call?.name ?? "",
    toolInput: JSON.parse(
      lastMessage.additional_kwargs.function_call?.arguments ?? "{}",
    ),
  };
  // We call the tool_executor and get back a response.
  const response = await toolExecutor.invoke(action);
  // We use the response to create a FunctionMessage.
  const functionMessage = new FunctionMessage({
    name: action.tool,
    content: response,
  });
  return [functionMessage];
}

/**
 * Transform the query to produce a better question.
 * @param {Array<BaseMessage>} state - The current state of the agent, including all messages.
 * @param {RunnableConfig | undefined} config - The configuration for the runnable.
 * @returns {Array<BaseMessage>} - The updated state with the new message added to the list of messages.
 */
async function rewrite(state) {
  console.log("---TRANSFORM QUERY---");
  const question = state[0].content;
  const prompt = ChatPromptTemplate.fromTemplate(
    `Look at the input and try to reason about the underlying semantic intent / meaning. \n 
  Here is the initial question:
  \n ------- \n
  {question} 
  \n ------- \n
  Formulate an improved question:`,
  );

  // Grader
  const model = new ChatOpenAI({
    modelName: "gpt-4-0125-preview",
    temperature: 0,
    streaming: true,
  });
  const response = await prompt.pipe(model).invoke({ question });
  return [response];
}

/**
 * Generate answer
 * @param {Array<BaseMessage>} state - The current state of the agent, including all messages.
 * @param {RunnableConfig | undefined} config - The configuration for the runnable.
 * @returns {Array<BaseMessage>} - The updated state with the new message added to the list of messages.
 */
async function generate(state) {
  console.log("---GENERATE---");
  const question = state[0].content;
  const sendLastMessage = state[state.length - 2];

  const docs = sendLastMessage.content;

  const prompt = await pull("rlm/rag-prompt");

  const llm = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0,
    streaming: true,
  });

  const ragChain = prompt.pipe(llm).pipe(new StringOutputParser());

  const response = await ragChain.invoke({
    context: docs,
    question,
  });

  return [new AIMessage(response)];
}

// graph

// Define a new graph
const workflow = new MessageGraph()
  // Define the nodes which we'll cycle between.
  .addNode("agent", agent)
  .addNode("retrieve", retrieve)
  .addNode("gradeDocuments", gradeDocuments)
  .addNode("rewrite", rewrite)
  .addNode("generate", generate);
  .addEdge(START, "agent");
  .addConditionalEdges(
    "agent",
    // Assess agent decision
    shouldRetrieve,
  )
  .addEdge("retrieve", "gradeDocuments")
  .addConditionalEdges(
    "gradeDocuments",
    // Assess agent decision
    checkRelevance,
    {
      // Call tool node
      yes: "generate",
      no: "rewrite", // placeholder
    },
  )
  .addEdge("rewrite", "agent")
  .addEdge("generate", END)
  
// Compile
const app = workflow.compile();

const inputs = [
  new HumanMessage(
    "What are the types of agent memory based on Lilian Weng's blog post?",
  ),
];
let finalState;
for await (const output of await app.stream(inputs)) {
  for (const [key, value] of Object.entries(output)) {
    console.log(`Output from node: '${key}'`);
    // Optionally log the output
    // console.log("---");
    // console.log(JSON.stringify(value, null, 2));
    finalState = value;
  }
  console.log("\n---\n");
}

console.log('结果：\n', JSON.stringify(finalState, null, 2));