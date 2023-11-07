import { env } from "$env/dynamic/public";
import { SSE } from "sse.js";


const BASE_URL = env.BASE_URL;
const TALKING_URL = env.TALKING_URL;


export async function fetchTextStream(query: string, knowledge_base_id: string) {
	const payload = {
		"query": query,
		"domain": "test",
		knowledge_base_id
	}
	const url = `${env.KNOWLEDGE_BASE_URL}/chat`;

	return new SSE(url, {
		headers: { "Content-Type": "application/json" },
		payload: JSON.stringify(payload),
	})
}

export async function fetchAudioText(file) {
	const url = `${TALKING_URL}/asr`
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
	const url = `${TALKING_URL}/llm_tts`
	return new SSE(url, {
		headers: { "Content-Type": "application/json" },
		payload: JSON.stringify({ text, voice, knowledge_id }),
	})
}

export async function fetchUploadProgress(images) {
	const url = `${BASE_URL}/progress`;
	const init: RequestInit = {
		method: "GET",
		
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

