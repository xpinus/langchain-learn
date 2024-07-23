import request from "../request.js";
import * as cheerio from "cheerio";

class BingVideoSearch {
	static async search(keyword) {
		const res = await request.get(
			`https://cn.bing.com/videos/search?q=${keyword}&qs=n&form=QBVR&=%25e%E7%AE%A1%E7%90%86%E6%90%9C%E7%B4%A2%E5%8E%86%E5%8F%B2%E8%AE%B0%E5%BD%95%25E&sp=-1&lq=0&pq=${keyword}&sc=0-9&sk=&cvid=9C2543DB136E4075AC8200893271C1E9&ghsh=0&ghacc=0&ghpl=`
		);

		const $ = cheerio.load(res.data);

		const videoEls = $(".mc_fgvc_u").toArray();

		const videoInfos = videoEls.map((videoEl) => {
			return {
				href: $(videoEl).find("a").attr("href"),
				title: $(videoEl).find(".mc_vtvc_title").attr("title"),
				cover: $(videoEl).find(".rms_img").attr("src"),
				duration: $(videoEl).find(".mc_bc_rc.items").text(),
				uv: $(videoEl)
					.find(
						".mc_vtvc_meta_block_area .mc_vtvc_meta_block .mc_vtvc_meta_row:eq(0) .meta_vc_content:eq(0)"
					)
					.text(),
				date: $(videoEl)
					.find(
						".mc_vtvc_meta_block_area .mc_vtvc_meta_block .mc_vtvc_meta_row:eq(0) .meta_vc_content:eq(1)"
					)
					.text(),
				from: $(videoEl)
					.find(
						".mc_vtvc_meta_block_area .mc_vtvc_meta_block .mc_vtvc_meta_row:eq(1) .meta_vc_content:eq(0)"
					)
					.text(),
				author: $(videoEl)
					.find(
						".mc_vtvc_meta_block_area .mc_vtvc_meta_block .mc_vtvc_meta_row:eq(1) .meta_vc_content:eq(1)"
					)
					.text(),
				label: $(videoEl).find("a").attr("aria-label"),
			};
		});

		return videoInfos;
	}
}

export default BingVideoSearch;
