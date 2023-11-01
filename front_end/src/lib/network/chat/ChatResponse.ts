import { env } from '$env/dynamic/public';
import { fetchMsg, tmpVideo } from '$lib/network/image/Network';

const GETIMAGELIST_URL = env.GETIMAGELIST_URL;
const UPLOAD_IMAGE_URL = env.UPLOAD_IMAGE_URL;
const BASE_URL = env.BASE_URL;


async function chatMessage(query:string, voice_id: string, knowledge_id: string, ImageList: {imgSrc: string;imgId: string;}[], isVideo: boolean) {
	if (ImageList.length === 0) {
		let result = {
			query,
			voice_id,
			knowledge_id
		}
		return fetchMsg('/chatWithImage', result)
	} else if (isVideo) {
		let blob = await fetch(ImageList[ImageList.length - 1].imgSrc).then(r => r.blob());
		const url = await tmpVideo(query, blob)
		return {
			type: 'video',
			url
		}
	} else {
		let result = {
			query,
			ImageList,
		};
		return fetchMsg('/image2Image', result)
	}
}

export default { chatMessage };
