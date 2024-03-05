import { env } from "$env/dynamic/public";
import { SSE } from "sse.js";

const PDF_BASE_URL = env.PDF_BASE_URL;


export async function fetchTextStream(
	query: string,
	knowledge_base_id: string,
) {
	let payload = {};
	let url = "";

	payload = {
		query: query,
		translated: "What is PAE?",
		knowledge_base_id: knowledge_base_id,
		stream: true,
		max_new_tokens: 128,
		return_link: false,
	};
	url = `${PDF_BASE_URL}/chat`;

	return new SSE(url, {
		headers: { "Content-Type": "application/json" },
		payload: JSON.stringify(payload),
	});
}
