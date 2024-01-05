import { env } from "$env/dynamic/public";
import { SSE } from "sse.js";
import { sendPostRequest } from "../image/Network";

const BASE_URL = env.BASE_URL;
const TALKING_URL = env.TALKING_URL;
const TEXT_URL = env.KNOWLEDGE_BASE_URL;

export async function fetchTextStream(query: string, knowledge_base_id: string) {
	const payload = {
		"query": query,
		"domain": "test",
		"knowledge_base_id": knowledge_base_id,
		"max_new_tokens": 128,
		"stream": true
	};
	let url = "";

	console.log('knowledge_base_id', knowledge_base_id);

	if (knowledge_base_id !== "default") {
		url = `${TEXT_URL}/chat`;
	} else {
		payload["max_new_tokens"] = 256;
		url = `https://198.175.88.26:443/v1/textchat/chat`;
	}

	return new SSE(url, {
		headers: { "Content-Type": "application/json" },
		payload: JSON.stringify(payload),
	})
}

export async function fetchVideoText(query: string, knowledge_base_id: string) {
	const payload = {
		"query": query,
		"domain": "test",
		"knowledge_base_id": knowledge_base_id,
		"max_new_tokens": 256,
		"stream": false
	};
	let url = "";

	if (knowledge_base_id !== "default") {
		url = `${TEXT_URL}/chat`;
	} else {
		url = `https://198.175.88.26:443/v1/textchat/chat`;
	}

	sendPostRequest(url, JSON.stringify(payload));
}

export async function fetchAudioText(file: string | Blob) {
	const url = `${TALKING_URL}/asr`
	const formData = new FormData()
	formData.append('file', file)
	sendPostRequest(url, formData);
}

export async function fetchAudioStream(text: string, voice: any, knowledge_id: any) {
	const url = `${TALKING_URL}/llm_tts`
	return new SSE(url, {
		headers: { "Content-Type": "application/json" },
		payload: JSON.stringify({ text, voice, knowledge_id }),
	})
}

export async function fetchUploadProgress() {
	const url = `${BASE_URL}/progress`;
	sendPostRequest(url);
}

