import {MIME_SUFFIX, SUFFIX_MIME} from './fileType.js'

/**
 * @param {ReadableStream<Uint8Array>} reader 
 */
export async function* ReadStramByChunk(reader) {
    let {done, value} = await reader.read();
    while(!done){
        yield value;
        ({done, value} = await reader.read());
    }
}

/**
 * @param {string} MIME 
 */
function MIME2Suffix(MIME){
    return MIME_SUFFIX[MIME] ?? "";
}

/**
 * @param {string} suf 
 */
function suffix2MIME(suf){
    return SUFFIX_MIME[suf] ?? "application/octet-stream";
}

/**
 * 智能fetch
 * @param {RequestInfo | URL} url url
 * @param {(url: string, MIME: string) => string} nameGetter 获取名字的函数
 * @param {(chunk: Uint8Array) => void} hook 接收chunk时调用
 * @param {RequestInit | undefined} init init
 * @returns file
 */
export async function FetchFile(url, nameGetter, hook, init){
    const res = await fetch(url, init);
    if(!res.ok){
        throw new Error(await res.text());
    }
   
    let content = [];
    for await (let chunk of ReadStramByChunk(res.body.getReader())){
        hook(chunk);
        content.push(chunk);
    }

    const type = res.headers.get("Content-Type");
    const name = nameGetter(url, type);
    return new File(content, name, {
        type,
    });
}

/**
 * 
 * @param {string} hash 
 * @param {(chunk: Uint8Array) => void} hook 
 * @returns 
 */
export async function getFileByHash(hash, hook=(()=>{})){
    return FetchFile(
        `//static.dao3.fun/block/${hash}`,
        (url, MIME) => `${hash}${MIME2Suffix(MIME)}`,
        hook
    )
}

export async function post(data, MIME) {
    const postResult = await fetch("//static.dao3.fun/block/", {
        method: "POST",
        headers: {
            "Content-Type": MIME,
        },
        body: data,
        mode: "cors"
    });
    const resultData = await postResult.json();
    return resultData;
}

export async function postText(data){
    return post(data, "text/plain");
}

/**
 * 
 * @param {File} file 
 * @param {(ev: ProgressEvent<FileReader>) => void} hook 
 */
export async function postFile(file, hook){
    const MIME = suffix2MIME('.'+file.name.split('.').at(-1));
    const reader = new FileReader();
    return new Promise((res, rej)=>{
        reader.addEventListener("load", async function(){
            const data = reader.result
            res(await post(data, MIME));
        })
        reader.addEventListener("error", async function(e){
            rej(e);
        })
        reader.addEventListener("progress", hook);
        reader.readAsArrayBuffer(file);  
    })
}

// function postFile() {
//     const input = document.getElementById("file");
//     const file = input.files[0];
//     const reader = new FileReader();
//     reader.onload = async function () {
//         const data = reader.result;
//         await post(data);
//     };
//     reader.readAsText(file);
// };
// async function postText() {
//     const text = document.getElementById("text");
//     const data = text.value;
//     if (data.length === 0) return;
//     await post(data);
//     text.value = "";
// }