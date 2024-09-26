import weaviate from "weaviate-client";

const client = await weaviate.connectToLocal();

const jeopardy = client.collections.get("Langchainjs_test");

const result = await jeopardy.query.nearText("biology", {
	limit: 2,
	returnMetadata: ["distance"],
});

result.objects.forEach((item) => {
	console.log(JSON.stringify(item.properties, null, 2));
	console.log(item.metadata?.distance);
});
