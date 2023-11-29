import { env } from '$env/dynamic/public';

const AUDIO_URL = env.AUDIO_URL;
const RETRIEVAL_URL = env.RETRIEVAL_URL;

export async function fetchKnowledgeBaseId(file: Blob, fileName: string) {
	const url = `${RETRIEVAL_URL}/create`
	const formData = new FormData()
	formData.append('file', file, fileName)
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

export async function fetchKnowledgeBaseIdByPaste(pasteUrlList: any) {	
	const url = `${RETRIEVAL_URL}/upload_link`
	const data = {
		"link_list": pasteUrlList,
	}
	const init: RequestInit = {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
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

export async function fetchAudioEmbedding(audio: Blob, qualityMode: boolean) {
	const url = `${AUDIO_URL}/create_embedding`
	const formData = new FormData()
	formData.append('file', audio, "tmp.mp3")
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