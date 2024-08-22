import axios from "axios";
import * as cheerio from "cheerio";

const res = await axios.get(
	`https://noteyd.chaoxing.com/pc/note_note/myNotesLatest`,
	{
		headers: {
			"User-Agent":
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.142.86 Safari/537.36",
			cookie:
				"lv=1; xxtenc=19a0bfd71b07675b3f0f5cd66b6655eb; siteType=4; experimentation_subject_id=IjM2MmZiYmE0LWQwNGUtNGRmMy04MTk1LTc3MjZhODYxOGNkOSI%3D--213cef9e6795a4e8af4ed9c21f85c781164ec732; wfwfid=171833; source=num1; workRoleBenchId=120506; wfwEnc=AADEE18EA25E78FB24B941F2B3F562C0; workbenchNewId=132687; _uid=149471196; vc=DBB7B83F05583C51F962DC9D129D05BF; browserLocale=zh_CN; msign_dsr=1721990902379; search_uuid=cdf56cf1%2d5ba9%2d4ca2%2dbee2%2dd81f494d4ab1; fid=1385; uf=b2d2c93beefa90dcafccd39bd3267611162f58f84fd52c74a0812e44243cc060d2696aa95a5d02a73a9a12b4740703ad913b662843f1f4ad6d92e371d7fdf644a40702027891bf098b6f06f3c6e4d776eea6be31981211d207f6e3faf649208174fa3d48044e9c3e; _d=1722564232536; UID=149471196; vc2=C3A6FAC2C81882E9C27286B96DE007D8; vc3=dGdOjaZ7jW5JrtWi3tDY6uhT11uELfE6FC5n9CQh5ZwijFzrNK%2F%2F0nZwufzCTtQdxGiLK96yxlSm2IwEPsQdDzINXzfiNTBALNlJdeyIRC8wltOmH2H3ldUWWffGwhTpo%2Fvfvs4iZKNM%2B8GNFMgVJmSx2zHQVCQgvXubLT1bJgU%3D88cfa75bec40710194f0c78263d3f46d; cx_p_token=13e53347f72c40f954208fe2161dd57d; p_auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIxNDk0NzExOTYiLCJsb2dpblRpbWUiOjE3MjI1NjQyMzI1MzgsImV4cCI6MTcyMzE2OTAzMn0.f3ZgaUJ6ELK7Em9RLjRriRBv59Dsw5mTHMHTDGWhBdk; DSSTASH_LOG=C_38-UN_9324-US_149471196-T_1722564232538; JSESSIONID=1CDE9891F1B9C222E57BB04DF0BAAC30.NoteService; route=f0ae18311fcc79162ac8695e96ba5fc9",
		},
		params: {
			notebookCid: "gerenbiji149471196",
			kw: "",
			offsetValue: "",
			top: 0,
			maxW: 80,
			pageSize: 30,
			showCollection: 0,
			_t: 2,
		},
	}
);

console.log(res.data.msg.list.map((item) => item.title));
