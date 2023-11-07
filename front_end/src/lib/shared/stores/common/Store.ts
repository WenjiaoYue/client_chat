import { writable } from 'svelte/store';

export interface ImgInfo {
  image_id: number;
  image_path: string;
  caption: string;
  checked: boolean;
  location: string;
  time: string;
  tag_list: [string, string][];
};


// export interface ImgList {
//   [index: string]: {
//     [index: string]: ImgItem[]
//   }
// }

export interface ImgListPiece {
  image_id: string;
  image_path: string;
}

export let open = writable(true);

export let imageList = writable<Array<ImgListPiece>>([]);

export let droppedObj = writable({});

export let hintUploadImg = writable(true);

export let isLoading = writable(false);

export let newUploadNum = writable(0)

export let countDown = writable(0);

export let ifStoreMsg = writable(true)

export const resetControl = writable(false);

export let currentMode = writable("Text");

export let videoMode = writable("input");

export let photoMode = writable("photoChat");

export const TalkingPhotoCustom = writable<{
  name: string;
  avatar: string;
}[]>([])

export const TalkingVoiceCustom = writable<{
  name: string;
  audio: string;
  id: string;
}[]>([])

export const TalkingKnowledgeCustom = writable<{
  name: string;
  src: string;
  id: string;
}[]>([])


export enum CollectionType {
  Custom, Library
}

export let currentAvaTar = writable<{
  collection: CollectionType,
  id: number
}>({
  collection: CollectionType.Library,
  id: 0
});

export let currentVoice = writable<{
  collection: CollectionType,
  id: number
}>({
  collection: CollectionType.Library,
  id: 0
});

export let currentKnowledge = writable<{
  collection: CollectionType,
  id: number
}>({
  collection: CollectionType.Library,
  id: 0
});

export const popupModal = writable(false);

