const AUDIO_URL = 'http://54.87.46.229:80/v1/talkingbot'

export async function fetchKnowledgeBaseId(file) {
	const url = `${AUDIO_URL}/create_kb`
	const formData = new FormData()
	formData.append('file', file)
    const init: RequestInit = {
        method: "POST",
        body: formData,
    };
	
	try {
		let response = await fetch(url, init);
		if (!response.ok) throw response.status
		return await response.json();

	} catch (error) {
		console.error('network error: ', error);
		return undefined
	}
}

export async function fetchAudioEmbedding(audio) {
	const url = `${AUDIO_URL}/create_embedding`
	const formData = new FormData()
	formData.append('file', audio)
    const init: RequestInit = {
        method: "POST",
        body: formData,
    };
	
	try {
		let response = await fetch(url, init);
		if (!response.ok) throw response.status
		return await response.json();

	} catch (error) {
		console.error('network error: ', error);
		return undefined
	}
}