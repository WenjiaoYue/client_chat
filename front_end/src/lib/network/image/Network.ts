import { env } from "$env/dynamic/public";

const PHOTO_URL = env.PHOTO_URL;
const FACE_ANIMATION_URL = env.FACE_ANIMATION_URL;

export async function uploadImages(image_list) {
	const url = `${PHOTO_URL}/uploadImages`;
	const init: RequestInit = {
		method: "POST",
		
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ image_list }),
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


export async function fetchImageList() {
	const url = `${PHOTO_URL}/getAllImages`
	const init: RequestInit = {
		method: "POST",
		
	}
	try {
		const response = await fetch(url, init);
		if (!response.ok) throw response.status
		return await response.json();
	} catch (error) {
		console.error('network error: ', error);
		return undefined
	}
}

export async function tmpVideo(query: string | Blob, imageBlob: Blob, voice_id: string | Blob) {
	const url = `${FACE_ANIMATION_URL}`;
	const formData = new FormData()
	formData.append('image', imageBlob, 'remote-image.jpg');
	formData.append('text', query);
	formData.append('mode', "fast");
	formData.append('voice', voice_id);

	const init: RequestInit = {
		method: "POST",
		body: formData,
	};

	try {
		const response = await fetch(url, init);
		if (!response.ok) throw response.status
		const videoData = await response.blob();

		const videoUrl = URL.createObjectURL(videoData);
		return videoUrl;
	} catch (error) {
		console.error('network error: ', error);
		return undefined
	}
}

export async function fetchMsg(suffix, payload) {
	const url = `${PHOTO_URL}` + suffix;
	return sendPostRequest(url, payload);
}


export async function fetchTypeList() {
	const url = `${PHOTO_URL}/getTypeList`;
	return sendPostRequest(url);
}

export async function fetchImageDetail(image_id: string) {
	const url = `${PHOTO_URL}/getImageDetail`;
	return sendPostRequest(url, { image_id });
}

export async function fetchImagesByType(type, subtype) {
	const url = `${PHOTO_URL}/getImageByType`;
	return sendPostRequest(url, { type, subtype });
}

export async function updateLabel(label, from, to) {
	const url = `${PHOTO_URL}/updateLabel`;
	return sendPostRequest(url, { label_list: [{ label, from, to }] });
}

export async function updateImageInfo(image_id, payload, urlSuffix) {
	const url = `${PHOTO_URL}` + urlSuffix;
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

	const init: RequestInit = {
		method: "POST",
		
		body: JSON.stringify(extractedObject),
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

async function sendPostRequest(url: string, payload: Object = {}) {
	try {
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		if (!response.ok) throw response.status;

		return await response.json();
	} catch (error) {
		console.error("network error: ", error);
		return undefined;
	}
}
