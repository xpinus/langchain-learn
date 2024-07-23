import axios from "axios";

const request = axios.create();

// Request interceptors
request.interceptors.request.use(
	(config) => {
		config.headers["User-Agent"] =
			"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.142.86 Safari/537.36";

		return config;
	},
	(error) => {
		Promise.reject(error);
	}
);

export default request;
