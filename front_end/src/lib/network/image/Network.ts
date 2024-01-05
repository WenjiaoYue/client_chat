import { env } from "$env/dynamic/public";

const BASE_URL = env.BASE_URL;

export async function uploadImages(image_list: { imgSrc: string }[]) {
	const url = `${BASE_URL}/uploadImages`;
	sendPostRequest(url, JSON.stringify({ image_list }))
}

export async function fetchUploadProgress() {
	const url = `${BASE_URL}/progress`;
	sendPostRequest(url);
}

export async function fetchImageList() {
	const url = `${env.BASE_URL}/getAllImages`;
	sendPostRequest(url);
}

export async function tmpVideo(query: string | Blob, imageBlob: Blob, voice_id: string | Blob) {
	const url = `${env.VIDEO_URL}`;
	const formData = new FormData()
	formData.append('image', imageBlob, 'remote-image.jpg');
	formData.append('text', query);
	formData.append('mode', "fast");
	formData.append('voice', voice_id);

	sendPostRequest(url, formData)
}

export async function fetchMsg(suffix: string, payload: object) {
	const url = `${env.BASE_URL}` + suffix;
	return sendPostRequest(url, JSON.stringify(payload));
}

// chat/knowldge 
export async function fetchTextMsg(suffix: string, payload: object) {
	const url = `${env.KNOWLEDGE_BASE_URL}` + suffix;
	return sendPostRequest(url, JSON.stringify(payload));
}

export async function fetchTypeList() {
	const url = `${env.BASE_URL}/getTypeList`;
	return sendPostRequest(url);
}

export async function fetchImageDetail(image_id: string) {
	const url = `${BASE_URL}/getImageDetail`;
	return sendPostRequest(url, image_id);
}

export async function fetchImagesByType(type: string, subtype: string) {
	const url = `${BASE_URL}/getImageByType`;
	return sendPostRequest(url, JSON.stringify({ type, subtype }));
}

export async function updateLabel(label: string, from: string, to: string) {
	const url = `${BASE_URL}/updateLabel`;
	return sendPostRequest(url, JSON.stringify({ label_list: [{ label, from, to }] }));
}

export async function updateImageInfo(image_id: number | string, payload: object | undefined, urlSuffix: string) {
	const url = `${BASE_URL}` + urlSuffix;
	let extractedObject;

	if (payload) {
		extractedObject = {
			image_list: [
				{
					image_id,
					...payload,
				},
			],
		};
	} else {
		extractedObject = {
			image_id,
		};
	}

	sendPostRequest(url, JSON.stringify(extractedObject))
}

export async function sendPostRequest(url: string, payload?: BodyInit | null | undefined) {
	try {
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: payload,
		});

		if (!response.ok) throw response.status;

		return await response.json();
	} catch (error) {
		console.error("network error: ", error);
		return undefined;
	}
}
