// It can save you money by reducing the number of API calls you make to the LLM provider, if you're often requesting the same completion multiple times. It can speed up your application by reducing the number of API calls you make to the LLM provider.

import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";
import { Redis } from "ioredis";
import { RedisCache } from "@langchain/community/caches/ioredis";

const client = new Redis({
	port: 6379,
	password: "97716",
});

const cache = new RedisCache(client, {
	ttl: 60, // Optional key expiration value
});

const model = new ChatOpenAI({ cache });

const response1 = await model.invoke("Do something random!");
console.log(response1);
/*
  AIMessage {
    content: "Sure! I'll generate a random number for you: 37",
    additional_kwargs: {}
  }
*/

const response2 = await model.invoke("Do something random!");
console.log(response2);
/*
  AIMessage {
    content: "Sure! I'll generate a random number for you: 37",
    additional_kwargs: {}
  }
*/

await client.disconnect();
