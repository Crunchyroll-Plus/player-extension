var ports = [];
var message_history = [];

chrome.runtime.onConnect.addListener((port) => {    
    ports.push(port)

    for(let request of message_history) {
        port.postMessage(request)
    }

    // message_history = [];

    port.onDisconnect.addListener(() => {
        ports.splice(ports.indexOf(port), 1);
    })

    port.onMessage.addListener(request => {
        message_history.push(request);

        for(let p of ports) {
            p.postMessage(request)
        }
    })
});

export default true;