import { fetchImageDetail } from "$lib/network/image/Network";
import { format } from "date-fns";

export async function getImageDetail(image_id: string) {
    const res = await fetchImageDetail(image_id);
    const tag_list = Object.entries(res.tag_list).filter(item =>
        (item[0] !== "time" && item[0] !== "location"))
    const newObj = {
        ...res,
        location: res.tag_list["location"] || "MISC",
        time: res.tag_list["time"] || format(new Date(), 'yyyy-MM-dd'),
        tag_list
    }
    return newObj
}