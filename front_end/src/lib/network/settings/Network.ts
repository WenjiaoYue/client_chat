import { env } from "$env/dynamic/public";

const PHOTO_URL = env.PHOTO_URL;


export async function onCountdownEnd() {	
	const url = `${PHOTO_URL}/deleteUser`
    const init: RequestInit = {
        method: "POST",
		
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


