import request from "../request.js";
import * as cheerio from "cheerio";

class BaiduVideoSearch {
	static async search(keyword) {
		const res = await request.get(
			`https://www.baidu.com/sf/vsearch?wd=${keyword}&pd=video&tn=vsearch&lid=c57e878e00206f91&ie=utf-8&rsv_spt=4&rsv_bp=1&f=8&oq=%25E5%258C%2597%25E4%25BA%25AC%25E6%2597%25A5%25E8%25AF%25AD%25E6%2595%2599%25E5%25AD%25A6&rsv_pq=c57e878e00206f91&rsv_t=48c7VDbP7J3uUVREHSBT7GSsKDuQC4Aqp1ocEtoiaF2M%252FHHCeo9NnV91sESpXQ`
		);

		const $ = cheerio.load(res.data);

		const videoEls = $(".video_list").toArray();

		const videoInfos = videoEls.map((videoEl) => {
			return {
				href: $(videoEl).find("a").attr("href").trim(),
				title: $(videoEl).find(".video-title").text().trim(),
				cover: $(videoEl).find("a img").attr("src"),
				duration: $(videoEl).find(".video_play_timer").text(),
				date: $(videoEl).find(".video_small_intro .c-font-normal:eq(1)").text(),
				from: $(videoEl).find(".wetSource").text(),
			};
		});

		return videoInfos;
	}
}

export default BaiduVideoSearch;
