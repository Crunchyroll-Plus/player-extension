const ports = [];
const message_history = [];

chrome.runtime.onConnect.addListener((port) => {    
    ports.push(port)

    for(let request of message_history) {
        port.postMessage(request)
    }

    port.onDisconnect.addListener(() => {
        ports.splice(ports.indexOf(port), 1);
    })

    port.onMessage.addListener(request => {
        message_history.splice(0, 0, request);

        for(let p of ports) {
            p.postMessage(request)
        }
    })
});