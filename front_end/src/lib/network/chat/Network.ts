import { env } from "$env/dynamic/public";
import { SSE } from "sse.js";


const TEXT_URL = env.KNOWLEDGE_BASE_URL;


export async function fetchTextStream(query: string, knowledge_base_id: string) {
	let payload = {};
	let url = "";

	payload = {
		query: query,
		translated: query,
		knowledge_base_id: "default",
		stream: true,
		max_new_tokens: 128,
		return_link: false,
	};
	url = `http://10.7.4.144:8007/v1/askdoc/chat`;
	
	return new SSE(url, {
		headers: { "Content-Type": "application/json" },
		payload: JSON.stringify(payload),
	})
}



