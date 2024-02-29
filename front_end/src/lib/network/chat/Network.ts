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
		knowledge_base_id: knowledge_base_id,
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
	knowledge_base_id: string,
	id
) {
	const url = `http://10.7.4.144:80/v2/rag/chat`;
	console.log("query knowledge_base_id", query, knowledge_base_id);
	let requestId = "request_id" + id;

	const postData = {
		prompt: query,
		request_id: requestId,
		kb_id: knowledge_base_id,
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

export async function fetchTextNoStream2(
	query: string,
	knowledge_base_id: string,
	id
) {
	const url = `http://10.112.228.151:80/v2/rag/chat`;
	let requestId = "request_id" + id;


	const postData = {
		inputs: [
			{
				name: "prompt",
				datatype: "BYTES",
				shape: [1],
				data: ["How many people will attend CES?"],
			},
			{
				name: "kb_id",
				datatype: "BYTES",
				shape: [1],
				data: [knowledge_base_id],
			},
			{
				name: "request_id",
				datatype: "BYTES",
				shape: [1],
				data: [requestId],
			},
		],
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
