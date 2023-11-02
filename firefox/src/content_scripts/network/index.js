const script = document.createElement('script');
script.src = chrome.runtime.getURL('src/content_scripts/network/inject/index.js');
script.onload = function() {
    this.remove();
};

(document.head || document.documentElement).appendChild(script);
// var hook_port ;


    var hook_port;

    function connectPort() {
        hook_port = chrome.runtime.connect({name: "hook"});
        hook_port.onMessage.addListener(request => {
            if(request.type !== "hook") return;
            window.postMessage(request.value);
        });
    }   
    
    connectPort();

    window.addEventListener("message", (event) => {
        if(event.data.type === "visit") {
            window.location.href = event.data.value;
            return;
        }

        try {
            hook_port.postMessage(event.data);
        } catch(e) {
            connectPort();
        }
    });