import { OpenAIEmbeddings } from '@langchain/openai';
import { BaseEmbeddings } from '../interfaces/base-embeddings.js';

export class OpenAi3SmallEmbeddings implements BaseEmbeddings {
    private model: OpenAIEmbeddings;

    constructor() {
        this.model = new OpenAIEmbeddings({
            modelName: 'text-embedding-3-small',
            maxConcurrency: 3,
            maxRetries: 5,
            // configuration: {
            //     baseURL: 'https://your_custom_url.com',
            // },
        });
    }

    getDimensions(): number {
        return 1536;
    }

    embedDocuments(texts: string[]): Promise<number[][]> {
        return this.model.embedDocuments(texts);
    }

    embedQuery(text: string): Promise<number[]> {
        return this.model.embedQuery(text);
    }
}
