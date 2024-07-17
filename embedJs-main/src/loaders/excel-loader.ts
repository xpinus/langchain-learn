import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { getTextExtractor } from 'office-text-extractor';
import md5 from 'md5';

import { BaseLoader } from '../interfaces/base-loader.js';
import { cleanString, isValidURL } from '../util/strings.js';

export class ExcelLoader extends BaseLoader<{ type: 'ExcelLoader' }> {
    private readonly filePathOrUrl: string;
    private readonly isUrl: boolean;

    constructor({
        filePathOrUrl,
        chunkOverlap,
        chunkSize,
    }: {
        filePathOrUrl: string;
        chunkSize?: number;
        chunkOverlap?: number;
    }) {
        super(`ExcelLoader_${md5(filePathOrUrl)}`, { filePathOrUrl }, chunkSize ?? 1000, chunkOverlap ?? 0);

        this.filePathOrUrl = filePathOrUrl;
        this.isUrl = isValidURL(filePathOrUrl) ? true : false;
    }

    override async *getUnfilteredChunks() {
        const chunker = new RecursiveCharacterTextSplitter({
            chunkSize: this.chunkSize,
            chunkOverlap: this.chunkOverlap,
        });

        const extractor = getTextExtractor();
        const xlsxParsed = await extractor.extractText({
            input: this.filePathOrUrl,
            type: this.isUrl ? 'url' : 'file',
        });

        const chunks = await chunker.splitText(cleanString(xlsxParsed));
        for (const chunk of chunks) {
            yield {
                pageContent: chunk,
                metadata: {
                    type: <'ExcelLoader'>'ExcelLoader',
                    source: this.filePathOrUrl,
                },
            };
        }
    }
}
