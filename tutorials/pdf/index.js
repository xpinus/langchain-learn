// Build a PDF ingestion and Question/Answering system
// https://js.langchain.com/v0.2/docs/tutorials/pdf_qa/

import "pdf-parse"; // Peer dep
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

export default async function main() {
	const loader = new PDFLoader("../../assets/hong.pdf");

	const docs = await loader.load();

	console.log(docs.length);
}
