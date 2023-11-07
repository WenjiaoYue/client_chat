import { env } from '$env/dynamic/public';
import { fetchMsg, fetchTextMsg, tmpVideo } from '$lib/network/image/Network';

const GETIMAGELIST_URL = env.GETIMAGELIST_URL;
const UPLOAD_IMAGE_URL = env.UPLOAD_IMAGE_URL;
const BASE_URL = env.BASE_URL;


async function chatMessage(query:string, voice_id: string, knowledge_base_id: string, 
	ImageList: {imgSrc: string;imgId: string;}[], isVideo: boolean, currentMode: string, videoMode: string, photoMode: string) {
	if (currentMode === 'Photo' && photoMode === 'photoChat') {
		const result = {
			query,
			knowledge_base_id,
			domain: "test",
		}
		
		return fetchMsg('/chatWithImage', result)
	} 
	if (currentMode === 'Video' && ImageList.length !== 0) {
		const blob = await fetch(ImageList[ImageList.length - 1].imgSrc).then(r => r.blob());
		const url = await tmpVideo(query, blob)
		return {
			type: 'video',
			url
		}
	} 
	if (photoMode === 'styleTransfer' && currentMode === 'Photo'){
		const result = {
			query,
			ImageList,
		};
		return fetchMsg('/image2Image', result)
	}

}

export default { chatMessage };
