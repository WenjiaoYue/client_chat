import { fetchMsg, tmpVideo } from '$lib/network/image/Network';
import { fetchVideoText } from '$lib/network/chat/Network';

async function chatMessage(query: string, voice_id: string, knowledge_base_id: string,
	ImageList: { imgSrc: string; imgId: string; }[], isVideo: boolean, currentMode: string, videoMode: string, photoMode: string) {
	if (currentMode === 'Search') {
		const result = {
			query,
			knowledge_base_id,
			domain: "test",
		}

		return fetchMsg('/chatWithImage', result)
	}
	if (currentMode === 'Video' && ImageList.length !== 0) {
		if (videoMode === 'output') {
			const result = await fetchVideoText(query, knowledge_base_id);
			// return value;
			query = result;

		}
		const blob = await fetch(ImageList[ImageList.length - 1].imgSrc).then(r => r.blob());
		const url = await tmpVideo(query, blob, voice_id)
		return {
			type: 'video',
			url
		}
	}
	if (currentMode === 'Photo') {
		const result = {
			query,
			ImageList,
		};
		return fetchMsg('/image2Image', result)
	}

}

export default { chatMessage };
