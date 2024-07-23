/**
 * 爬取各个搜索引擎搜索关键词的视频搜索结果
 */

import BingVideoSearch from "./engines/bing.js";
import BaiduVideoSearch from "./engines/baidu.js";
import SogouVideoSearch from "./engines/sogou.js";

function encodeKey(val) {
	const chr_filter = /[!'()*]/g;
	const value = val.toString().replace(chr_filter, "");
	return encodeURIComponent(value);
}

class WebVideoSearch {
	static engines = [BingVideoSearch, BaiduVideoSearch, SogouVideoSearch];

	static async search(keyword) {
		keyword = encodeKey(keyword);
		const results = [];

		// 1. 先从本地的搜索缓存中寻找看能够否找到足够的数据

		// 2. 如果不足，再各个搜索引擎中搜索看是否能够找到足够的数据

		const tasks = [];
		WebVideoSearch.engines.forEach((engine) => {
			tasks.push(engine.search(keyword));
		});

		await Promise.allSettled(tasks).then((res) => {
			res.forEach((item) => {
				if (item.status === "fulfilled") {
					results.push(...item.value);
				} else {
					// rejected
					console.error(item.reason);
				}
			});
		});

		return results;
	}
}

export default WebVideoSearch;
