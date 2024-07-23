import fetch from "node-fetch";

var search_url = "https://www.douyin.com/aweme/v1/web/general/search/single/";
var headers = {
	authority: "www.douyin.com",
	accept: "application/json, text/plain, */*",
	"accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
	"cache-control": "no-cache",
	pragma: "no-cache",
	referer:
		"https://www.douyin.com/user/MS4wLjABAAAAigSKToDtKeC5cuZ3YsDrHfYuvpLqVSygIZ0m0yXfUAI",
	"sec-ch-ua":
		'"Microsoft Edge";v="117", "Not;A=Brand";v="8", "Chromium";v="117"',
	"sec-ch-ua-mobile": "?0",
	"sec-ch-ua-platform": '"Windows"',
	"sec-fetch-dest": "empty",
	"sec-fetch-mode": "cors",
	"sec-fetch-site": "same-origin",
	"user-agent":
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36 Edg/117.0.2045.47",
};

function getSearchParams() {
	return {
		device_platform: "webapp",
		aid: "6383",
		channel: "channel_pc_web",
		search_channel: "aweme_general",
		sort_type: "0",
		publish_time: "0",
		keyword: "阔澜 可以点评四周的风景",
		search_source: "normal_search",
		query_correct_type: "1",
		is_filter_search: "0",
		from_group_id: "",
		// # "offset": "15",
		// # "count": "25",
		// # "search_id": "202310162344486FA7398D503D9C3E9846",
		pc_client_type: "1",
		version_code: "190600",
		version_name: "19.6.0",
		cookie_enabled: "true",
		screen_width: "1707",
		screen_height: "1067",
		browser_language: "zh-CN",
		browser_platform: "Win32",
		browser_name: "Edge",
		browser_version: "118.0.2088.46",
		browser_online: "true",
		engine_name: "Blink",
		engine_version: "118.0.0.0",
		os_name: "Windows",
		os_version: "10",
		cpu_core_num: "20",
		device_memory: "8",
		platform: "PC",
		downlink: "10",
		effective_type: "4g",
		round_trip_time: "50",
		webid: "",
		msToken: "",
	};
}

// import asyncio
// from playwright.async_api import async_playwright
// from urllib.parse import urlparse, parse_qs

// webid = None
// msToken = None
// cookies = None
// def handle_request(request):
//     url = request.url
//     if url.startswith('https://www.douyin.com/aweme/v1/web/user/profile/other/'):
//         parsed_url = urlparse(url)
//         query_params = parse_qs(parsed_url.query)
//         global webid
//         webid = query_params['webid'][0]

// # 每隔1秒判断webid是否拿到
// async def check_webid():
//     while True:
//         if webid is not None:
//             break
//         await asyncio.sleep(1)

// async def get_ttwid_and_webid():
//     url = 'https://www.douyin.com/user/MS4wLjABAAAAEpmH344CkCw2M58T33Q8TuFpdvJsOyaZcbWxAMc6H03wOVFf1Ow4mPP94TDUS4Us'
//     headless = False
//     print('如出现验证过程，请手动验证')
//     async with async_playwright() as p:
//         browser = await p.chromium.launch(
//             headless=headless,
//             args=[
//                 '--disable-blink-features=AutomationControlled',
//             ],
//             channel='chrome'
//         )
//         page = await browser.new_page()
//         page.on("request", lambda request: handle_request(request=request))
//         await page.goto(url)
//         await asyncio.sleep(3)
//         await check_webid()
//         page_cookies = await page.context.cookies()
//         await browser.close()
//         global cookies
//         cookies = {}
//         for cookie in page_cookies:
//             cookies[cookie['name']] = cookie['value']
//             if cookie['name'] == 'msToken':
//                 global msToken
//         msToken = cookie['value']

// def get_new_cookies():
//     asyncio.run(get_ttwid_and_webid())
//     return {
//         'webid': webid,
//         'msToken': msToken,
//         'cookies': cookies,
// }

function checkInfo() {
	// print('获取cookie时请关闭chrome浏览器），若cookie获取成功后仍运行失败，请清空static下的info.json文件，重新运行程序')
	// if not os.path.exists("./static/info.json"):
	//     open('./static/info.json', 'w')
	//     test_user_url = 'https://www.douyin.com/user/MS4wLjABAAAAEpmH344CkCw2M58T33Q8TuFpdvJsOyaZcbWxAMc6H03wOVFf1Ow4mPP94TDUS4Us'
	//     with open("./static/info.json", "r", encoding = "utf-8") as f:
	//         info = f.read()
	//         try:
	//             profile_url = "https://www.douyin.com/aweme/v1/web/user/profile/other/"
	//             info = json.loads(info)
	//             sec_user_id = test_user_url.split('/')[-1]
	//             params = get_profile_params()
	//             params['webid'] = info['webid']
	//             params['msToken'] = info['msToken']
	//             params['sec_user_id'] = sec_user_id
	//             splice_url_str = splice_url(params)
	//             xs = js.call('get_dy_xb', splice_url_str)
	//             params['X-Bogus'] = xs
	//             post_url = profile_url + '?' + splice_url(params)
	//             response = requests.get(post_url, headers = headers, cookies = info['cookies'])
	//             profile_json = response.json()
	//             print('cookie有效')
	//             return info
	//         except:
	//             print("cookie和其他信息失效，正在重新获取中...请等待，若时间超过20秒，重新运行程序")
	//             info = get_new_cookies()
	//             print("cookie和其他信息获取成功")
	//             with open("./static/info.json", "w", encoding = "utf-8") as f:
	//             f.write(json.dumps(info))
	//         return info
}

var info = checkInfo();

function search() {
	// 搜索关键词
	var query = "阔澜 可以点评四周的风景";
	// 0 智能排序, type='1' 热门排序, type='2' 最新排序
	var sort_type = "0";
	// 搜索的数量（前多少个）
	var number = 20;
	// 0为不限时间，其余数字为限制时间，如1是1天内的视频，666是666天内的视频
	var publish_time = "0";

	var params = getSearchParams();
	params["sort_type"] = sort_type;
	params["publish_time"] = publish_time;
	params["keyword"] = query;
	params["count"] = "25";
	params["webid"] = info["webid"];
	params["msToken"] = info["msToken"];
}

//     search.main(info)

search();

// class Search:
//     def __init__(self, info=None):
//         if info is None:
//             self.info = check_info()
//         else:
//             self.info = info
//         self.search_url = "https://www.douyin.com/aweme/v1/web/general/search/single/"
//         self.headers = get_headers()

//     def get_search_data(self, query, number, sort_type='0'):
//         params = get_search_params()
//         params['sort_type'] = sort_type
//         params['keyword'] = query
//         params['count'] = '25'
//         params['webid'] = self.info['webid']
//         params['msToken'] = self.info['msToken']
//         splice_url_str = splice_url(params)
//         xs = js.call('get_dy_xb', splice_url_str)
//         params['X-Bogus'] = xs
//         video_list = []
//         while len(video_list) < number:
//             post_url = self.search_url + '?' + splice_url(params)
//             response = requests.get(post_url, headers=self.headers, cookies=self.info['cookies'])
//             res = response.json()
//             for item in res['data']:
//                 if item['type'] == 1:
//                     try:
//                         video_detail = handle_search_info_each(item['aweme_info'])
//                         video_list.append(video_detail)
//                         if len(video_list) >= number:
//                             break
//                     except:
//                         continue
//             if not res['has_more']:
//                 print(f'搜索结果数量为 {len(video_list)}, 不足 {number}')
//                 break
//             params['offset'] = str(int(params.get('offset', 0)) + 10)
//             params['count'] = '10'
//         return video_list

//     def save_search_data(self, query, number, sort_type, publish_time, need_cover=False):

//         splice_url_str = splice_url(params)
//         xs = js.call('get_dy_xb', splice_url_str)
//         params['X-Bogus'] = xs
//         index = 0
//         while index < number:
//             post_url = self.search_url + '?' + splice_url(params)
//             response = requests.get(post_url, headers=self.headers, cookies=self.info['cookies'])
//             res = response.json()
//             for item in res['data']:
//                 if item['type'] == 1:
//                     try:
//                         video_detail = handle_search_info_each(item['aweme_info'])
//                         self.save_one_video_info(video_detail, need_cover)
//                         index += 1
//                         if index >= number:
//                             break
//                     except:
//                         continue
//             if not res['has_more']:
//                 print(f'搜索结果数量为 {index}, 不足 {number}')
//                 break
//             params['offset'] = str(int(params.get('offset', 0)) + 10)
//             params['count'] = '10'
//         print(f'搜索结果全部下载完成，共 {index} 个视频')

//     # 工具类，用于保存信息
//     def save_one_video_info(self, video, need_cover=False):
//         try:
//             title = norm_str(video.title)
//             if title.strip() == '':
//                 title = f'无标题'
//             if len(title) > 50:
//                 title = title[:50]
//             path = f'./search_datas/{video.nickname}_{video.sec_uid}/{title}_{video.awemeId}'
//             exist = check_and_create_path(path)
//             if exist and not need_cover:
//                 print(f'用户: {video.nickname}, 标题: {title} 本地已存在，跳过保存')
//                 return
//             save_video_detail(path, video)
//             if len(video.images) > 0:
//                 for img_index, image in enumerate(video.images):
//                     download_media(path, f'image_{img_index}', image['url_list'][0], 'image', f'第{img_index}张图片')
//             else:
//                 download_media(path, 'cover', video.video_cover, 'image', '视频封面')
//             download_media(path, 'video', video.video_addr, 'video')
//             print(f'用户: {video.nickname}, 标题: {title} 保存成功')
//         except:
//             print(f'用户: {video.nickname}, 标题: {norm_str(video.title)} 保存失败')
