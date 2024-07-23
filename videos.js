import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import WebVideoSearch from "./webpage/index.js";

async function videoSearch(key) {
	const results = await WebVideoSearch.search(key);

	const titles = results.map((res) => "Video Tile: " + res.title);

	const SEARCH_PROMPT = `You are a Japanese language teacher. Based on the keywords, select the relevant video from the video information provided for teaching.
  Here is the keywords: {keywords}
  Here is the video information to choose from:
  \n ------- \n
  {context}
  \n ------- \n
  
  Please return an array of the video information index, up to 10 entries, and sort the index by relevance, like [3,1] or [0].
  When there is no data that meets the criteria, just return an empty array.`;
	const prompt = ChatPromptTemplate.fromTemplate(SEARCH_PROMPT);

	const llm = new ChatOpenAI({
		temperature: 0,
	});

	const chain = prompt.pipe(llm).pipe(new JsonOutputParser());

	const indexs = await chain.invoke({ keywords: key, context: titles });
	const videos = indexs.map((index) => results[index]);

	return videos;
}

var key = "咖啡 日语教学";
const videos = await videoSearch(key);
console.log(videos);
// console.log(videos);
