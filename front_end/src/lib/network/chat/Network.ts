import { env } from "$env/dynamic/public";
import { SSE } from "sse.js";

const TEXT_URL = env.KNOWLEDGE_BASE_URL;

export async function fetchTextStream(
	query: string,
	knowledge_base_id: string
) {
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
	});
}

export async function fetchTextNoStream(
	query: string,
	knowledge_base_id: string
) {
	const url = `http://10.7.4.144:80/v2/rag/chat`;
	console.log("query knowledge_base_id", query, knowledge_base_id);

	const postData = {
		prompt: query,
		request_id: "111",
		kb_id: "default",
		stream: false,
	};

	const init: RequestInit = {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(postData),
	};

	try {
		const response = await fetch(url, init);
		if (!response.ok) throw response.status;
		return await response.json();
	} catch (error) {
		console.error("network error: ", error);
		return undefined;
	}
}
