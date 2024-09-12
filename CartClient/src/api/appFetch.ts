const HEADERS = {
  "Content-Type": "application/json",
};

const base = "http://localhost:5090/api/";
export const appPost = async (url: string, params: object) => {
  let res = await fetch(`${base}${url}`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ ...params }),
  });
  if (await checkRes(res)) {
    const response = await res.json();
    return response;
  }
  const response = await res.json();
  return response;
};

export const appPatch = async (url: string, params: object) => {
  let res = await fetch(`${base}${url}`, {
    method: "PATCH",
    body: JSON.stringify({ ...params }),
  });
  if (await checkRes(res)) {
    const response = await res.json();
    return response;
  }
  const response = await res.json();
  return response;
};

export const appGet = async (url: string, params: object | null = null) => {
  let searchString = `${base}${url}`;
  if (params) {
    let initialized = false;
    for (const [key, value] of Object.entries(params)) {
      if (!initialized) searchString = searchString + "?" + key + "=" + value;
      else searchString = `${searchString}&${key}=${value}`;
      initialized = true;
    }
  }
  let res = await fetch(searchString, {
    method: "GET",
    headers: HEADERS,
  });
  if (await checkRes(res)) {
    const response = await res.json();
    return response;
  }
  const response = await res.json();
  return response;
};

// Only has one parameter
export const appDelete = async (
  url: string,
  param: string | number | null = null
) => {
  let searchString = `${base}${url}`;
  if (param) {
    searchString = searchString + "?id=" + param;
  }
  let res = await fetch(searchString, {
    method: "DELETE",
    headers: HEADERS,
  });
  if (await checkRes(res)) {
    const response = await res.json();
    return response;
  }
};

const checkRes = async (res: any) => {
  if (!res.ok) {
    let text = await res.json();
    text = text.message;
    if (!text) text = res.statusText;
    throw new Error(text);
  }
  return true;
};
