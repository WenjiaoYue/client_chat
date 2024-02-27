const KNOWLEDGE_BASE_URL = "http://10.112.228.151:80/v2/rag";
// const KNOWLEDGE_BASE_URL = "http://10.112.228.151:8007/v1/askdoc";

export async function fetchKnowledgeBaseId(file: Blob, fileName: string) {
  const url = `${KNOWLEDGE_BASE_URL}/upload`;
  const formData = new FormData();
  formData.append("file", file, fileName);
  const init: RequestInit = {
    method: "POST",
    body: formData,
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

export async function fetchKnowledgeBaseIdByPaste(pasteUrlList: any) {
  const url = `${KNOWLEDGE_BASE_URL}/upload_link`;
  const data = {
    link_list: pasteUrlList,
  };
  const init: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
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
