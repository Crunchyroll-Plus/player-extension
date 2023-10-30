const __hooks = [];
const __blocks = [];
const __hookConfig = { };

var ogOpen = XMLHttpRequest.prototype.open;
var ogSend = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.open = function() {
    this.__url = arguments[1];
    this.__method = arguments[0];

    if(!this.__hook) {
        Object.defineProperty(this, "responseText", {
            get: () => {
                // Figure a better way to do this.
                var result = this.response;
                let found = __hooks.find(item => item.pattern.test(this.__url));
                result = found !== undefined && (found.method === undefined || found.method === this.__method) ? found.callback(result) : result;

                this.response = result;

                return result;
            }
        })

        this.__hook = true;
    }

    ogOpen.apply(this, arguments);
};

XMLHttpRequest.prototype.send = function() {
    let result = arguments[0];
    let found = __blocks.find(item => item.pattern.test(this.__url));
    result = found !== undefined && (found.method === undefined || found.method === arguments[0]) ? found.callback(result) : result;

    if(result === true) return; // Block the request.
    arguments[0] = result;

    ogSend.apply(this, arguments);
}

function addHook(pattern, callback) {
    __hooks.push({
        pattern: new RegExp(pattern),
        callback: callback
    })
}

function addBlock(pattern, callback) {
    __blocks.push({
        pattern: new RegExp(pattern),
        callback: callback
    })
}

window.onmessage = (event) => {
    let data = event.data;
    __hookConfig[data.name] = data.value;
};

var episode_information = {

}

addHook("https://www.crunchyroll.com/content/v2/cms/objects/(.+)?ratings=(.+)&locale=(.+)", (body) => {
    if(!window.location.href.startsWith("https://www.crunchyroll.com/watch/")) return body;
    let obj = JSON.parse(body);

    episode_information.currentEpisode = obj.data[0]

    if(episode_information.nextEpisode !== undefined)
        window.postMessage({
            type: "episode_information",
            value: episode_information
        })

    return body;
})

addHook("https://www.crunchyroll.com/content/v2/discover/up_next/(.+)", (body) => {
    if(!window.location.href.startsWith("https://www.crunchyroll.com/watch/")) return body;
    episode_information.nextEpisode = JSON.parse(body).data[0];

    if(episode_information.currentEpisode !== undefined)
        window.postMessage({
            type: "episode_information",
            value: episode_information
        })

    return body;
})