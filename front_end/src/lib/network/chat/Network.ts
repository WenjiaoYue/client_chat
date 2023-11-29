import { env } from "$env/dynamic/public";
import { SSE } from "sse.js";


const AUDIO_URL = env.AUDIO_URL;
const RETRIEVAL_URL = env.RETRIEVAL_URL;
const TEXT_CHAT_URL = env.TEXT_CHAT_URL;


export async function fetchTextStream(query: string, knowledge_base_id: string) {
	let payload = {};
	let url = "";

	console.log('knowledge_base_id', knowledge_base_id);
	
	if (knowledge_base_id !== "default") {
		payload = {
			"query": query,
			"domain": "test",
			"max_new_tokens": 128,
			knowledge_base_id,
			"stream": true

		}
		url = `${RETRIEVAL_URL}/chat`;

	} else {
		payload = {
			"query": query,
			"domain": "test",
			"stream": true,
			"max_new_tokens": 256,
			"knowledge_base_id": "default"
		}
		url = `${TEXT_CHAT_URL}/chat`;
	}

	return new SSE(url, {
		headers: { "Content-Type": "application/json" },
		payload: JSON.stringify(payload),
	})
}

export async function fetchVideoText(query: string, knowledge_base_id: string) {
	let payload = {};
	let url = "";

	if (knowledge_base_id !== "default") {
		payload = {
			"query": query,
			"domain": "test",
			"knowledge_base_id": knowledge_base_id,
			"max_new_tokens": 256,
			"stream": false
		}
		url = `${RETRIEVAL_URL}/chat`;

	} else {
		payload = {
			"query": query,
			"domain": "test",
			"knowledge_base_id": "default",
			"max_new_tokens": 256,
			"stream": false
		}
		url = `${TEXT_CHAT_URL}/chat`;
	}


	const init: RequestInit = {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	};

	try {
		const response = await fetch(url, init);
		if (!response.ok) throw response.status
		return await response.json();
	} catch (error) {
		console.error('network error: ', error);
		return undefined
	}

}

export async function fetchAudioText(file) {
	const url = `${AUDIO_URL}/asr`
	const formData = new FormData()
	formData.append('file', file)
	const init: RequestInit = {
		method: "POST",
		body: formData,
	};

	try {
		const response = await fetch(url, init);
		if (!response.ok) throw response.status
		return await response.json();
	} catch (error) {
		console.error('network error: ', error);
		return undefined
	}
}

export async function fetchAudioStream(text: string, voice: any, knowledge_id: any) {
	const url = `${AUDIO_URL}/llm_tts`
	return new SSE(url, {
		headers: { "Content-Type": "application/json" },
		payload: JSON.stringify({ text, voice, knowledge_id }),
	})
}


