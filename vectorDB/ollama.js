import { OllamaEmbeddings } from "@langchain/ollama";

// Create a vector store with a sample text
// import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { WeaviateStore } from "@langchain/weaviate";
import weaviate from "weaviate-ts-client";
import { v4 as uuidv4 } from "uuid";

const embeddings = new OllamaEmbeddings({
	model: "bge-m3:latest", // Default value
	baseUrl: "http://localhost:11434", // Default value
});

// The Weaviate SDK has an issue with types
const weaviateClient = weaviate.client({
	scheme: "http",
	host: "localhost:8080",
	// If necessary
	// apiKey: new ApiKey(process.env.WEAVIATE_API_KEY ?? "default"),
});

const vectorStore = new WeaviateStore(embeddings, {
	client: weaviateClient,
	// Must start with a capital letter
	indexName: "Langchainjs_test",
	// Default value
	textKey: "text",
	// Any keys you intend to set as metadata
	metadataKeys: ["source"],
});

const document1 = {
	pageContent: "The powerhouse of the cell is the mitochondria",
	metadata: { source: "https://example.com" },
};

const document2 = {
	pageContent: "Buildings are made out of brick",
	metadata: { source: "https://example.com" },
};

const document3 = {
	pageContent: "Mitochondria are made out of lipids",
	metadata: { source: "https://example.com" },
};

const document4 = {
	pageContent: "The 2024 Olympics are in Paris",
	metadata: { source: "https://example.com" },
};

// const documents = [document1, document2, document3, document4];
// const uuids = [uuidv4(), uuidv4(), uuidv4(), uuidv4()];

// await vectorStore.addDocuments(documents, { ids: uuids });

// Query vector store

const filter = {
	where: {
		operator: "Equal",
		path: ["source"],
		valueText: "https://example.com",
	},
};

// const similaritySearchResults = await vectorStore.similaritySearch(
// 	"biology",
// 	2,
// 	filter
// );

// for (const doc of similaritySearchResults) {
// 	console.log(`* ${doc.pageContent} [${JSON.stringify(doc.metadata, null)}]`);
// }

const retriever = vectorStore.asRetriever({
	// Optional filter
	filter: filter,
	k: 2,
});
console.log(await retriever.invoke("biology"));
