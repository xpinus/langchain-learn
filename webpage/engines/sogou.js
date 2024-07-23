import request from "../request.js";
import * as cheerio from "cheerio";

class SogouVideoSearch {
	static async search(keyword) {
		const res = await request.get(
			`https://v.sogou.com/v?query=${keyword}&typemask=6&p=40230608&w=06009900&dp=1&dr=&_asf=v.sogou.com&_ast=1721719177315&enter=1&ie=utf8`
		);

		const $ = cheerio.load(res.data);

		const videoEls = $(".short-video-item").toArray();

		const videoInfos = await Promise.all(
			videoEls.map(async (videoEl) => {
				let link =
					"https://v.sogou.com" + $(videoEl).children("a").attr("href").trim();

				link = await request.get(link).then((res) => {
					const $link = cheerio.load(res.data);

					return $link(".btn a").attr("href");
				});

				return {
					href: link,
					title: $(videoEl).find(".sort_lst_tit2 a").attr("title"),
					cover: $(videoEl).children("a").attr("data-src"),
					duration: $(videoEl).find(".thumb-duration").text(),
					date: $(videoEl).find(".sort_lst_txt")[0].children[1].data.trim(),
					from: $(videoEl).find(".sort_lst_txt_rgt").text(),
				};
			})
		);

		return videoInfos;
	}
}

export default SogouVideoSearch;
