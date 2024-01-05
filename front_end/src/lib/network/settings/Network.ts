import { env } from "$env/dynamic/public";
import { sendPostRequest } from "../image/Network";

const BASE_URL = env.BASE_URL;

export async function onCountdownEnd() {
	const url = `${BASE_URL}/deleteUser`
	sendPostRequest(url);
}


