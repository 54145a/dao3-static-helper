import { getFileByHash, postFile, postText } from "./hash";

//hello world: QmWDXASJ7wW316RRQi57fSXTscfnZ7vN2mJXVkXE8t5m5a
//an image: QmeXTsiLfsZ3zskcMtA4D4nXMAKjBZ7CmNj8WLWQ6nSUrs

// 读取Hash
; (async function () {
    let inputEl = document.getElementById("readHash");
    let tipEl = document.querySelector(".read .tip");
    let previewEl = document.querySelector(".read .preview .frame");
    let inputFormEl = document.getElementById("readHashForm");

    let fileName = null;
    let url = null;

    inputFormEl?.addEventListener("submit", async (ev) => {
        // 防止刷新
        ev.preventDefault();
        // 数据总量
        let byteNum = 0;
        // 提示
        tipEl.innerText = "正在启动传输……";
        try {
            let file = await getFileByHash(inputEl.value, (chunk) => {
                byteNum += chunk.length;
                tipEl.innerText = `已接收${byteNum}字节……`;
            });
            tipEl.innerText = `传输完毕！大小：${file.size}字节，文件类型：${file.type}`;

            fileName = file.name;
            url = URL.createObjectURL(file);
            // 预览
            previewEl.src = url;
        } catch (e) {
            tipEl.innerText = `传输失败！${e}`;
        }
    });

    let openBtn = document.getElementById("open");
    openBtn?.addEventListener("click", () => {
        open(`//static.dao3.fun/block/${inputEl.value}`, "_blank");
    });

    let downloadBtn = document.getElementById("download");
    downloadBtn?.addEventListener("click", async () => {
        if (!url || !fileName) {
            inputEl.submit();
        }
        let a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
    });
})();

// 上传文本
; (async function () {
    let inputEl = document.getElementById("postText");
    let tipEl = document.querySelector(".postText .tip");
    let inputFormEl = document.getElementById("postTextForm");

    inputFormEl?.addEventListener("submit", async (ev) => {
        ev.preventDefault();
        tipEl.innerText = "正在启动传输……";
        let res = await postText(inputEl.value);
        tipEl.innerText = `传输成功！${JSON.stringify(res)}`;
    });
})();

// 上传文件
; (async function () {
    let inputEl = document.getElementById("postFile");
    let tipEl = document.querySelector(".postFile .tip");
    let inputFormEl = document.getElementById("postFileForm");

    inputFormEl?.addEventListener("submit", async (ev) => {
        ev.preventDefault();
        tipEl.innerText = "传输中……";
        try {
            const file = inputEl.files[0];
            if (!file.name) {
                tipEl.innerText = "请选择文件";
                return;
            }

            const size = file.size;
            const res = await postFile(file, (ev) => {
                tipEl.innerText = `[${((size - ev.loaded) / size * 100).toFixed(0)}%] 共${size}字节，已传输${ev.loaded}字节`;
            });
            tipEl.innerText = `传输成功！${JSON.stringify(res)}`;
        } catch (e) {
            tipEl.innerText = `错误：${e}`;
        }
    });
})();

; (async function () {
    let previews = document.querySelectorAll(".preview");
    previews.forEach((preview) => {
        let btn = preview.querySelector(".change-preview-vis");
        let frame = preview.querySelector(".frame");
        btn.addEventListener("click", () => {
            if (frame.classList.contains("hidden")) {
                frame.classList.remove("hidden");
            } else {
                frame.classList.add("hidden");
            }
        });
    });
})();