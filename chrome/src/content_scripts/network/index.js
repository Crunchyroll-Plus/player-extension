const script = document.createElement('script');
script.src = chrome.runtime.getURL('src/content_scripts/network/inject/index.js');
script.onload = function() {
    this.remove();
};

window.addEventListener("message", (event) => {
    if(event.data.type === "visit") {
        window.location.href = event.data.value;
        return;
    }
    hook_port.postMessage(event.data);
});

(document.head || document.documentElement).appendChild(script);

const hook_port = chrome.runtime.connect({name: "hook"});
hook_port.onMessage.addListener(request => {
    if(request.type !== "hook") return;
    window.postMessage(request.value);
});