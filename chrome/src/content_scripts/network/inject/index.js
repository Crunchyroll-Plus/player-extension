const __hooks = [];
const __blocks = [];
const __hookConfig = {};

var ogOpen = XMLHttpRequest.prototype.open;
var ogSend = XMLHttpRequest.prototype.send;
var ogJson = Response.prototype.json;
var ogBody = Response.prototype.text;
var ogBlob = Response.prototype.blob;


Response.prototype.json = async function() {
    let result = await ogJson.apply(this, arguments);
    let found = __hooks.find(item => item.pattern.test(this.url));
    result = found !== undefined ? found.callback.call(this, result) : result;    
    
    return new Promise(function(resolve, reject) {
        try {
            resolve(result);
        } catch (e) { 
            reject(e);
        }
    });
}

Response.prototype.text = async function() {
    let result = await ogBody.apply(this, arguments);
    let found = __hooks.find(item => item.pattern.test(this.url));
    result = found !== undefined ? found.callback.apply(this, [result]) : result;

    return new Promise(function(resolve, reject) {
        try {
            resolve(result);
        } catch (e) { 
            reject(e);
        }
    });
}

Response.prototype.blob = async function() {
    let result = await ogBlob.apply(this, arguments);
    let found = __hooks.find(item => item.pattern.test(this.url));
    result = found !== undefined ? found.callback.apply(this, [result]) : result;

    return new Promise(function(resolve, reject) {
        try {
            resolve(result);
        } catch (e) { 
            reject(e);
        }
    });
}

XMLHttpRequest.prototype.open = function() {
    this.__url = arguments[1];
    this.__method = arguments[0];

    if(!this.__hook) {
        Object.defineProperty(this, "responseText", {
            get: () => {
                // Figure a better way to do this.
                var result = this.response;
                let found = __hooks.find(item => item.pattern.test(this.__url));
                result = found !== undefined && (found.method === undefined || found.method === this.__method) ? found.callback.apply(this, [result]) : result;
                
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

function addBodyHook(pattern, callback) {
    __hooks.push({
        pattern: new RegExp(pattern),
        callback: callback
    })
}

function addSendHook(pattern, callback) {
    __blocks.push({
        pattern: new RegExp(pattern),
        callback: callback
    })
}

window.onmessage = (event) => {
    let data = event.data;
    __hookConfig[data.name] = data.value;
};

// Episode Information
var episode_information = {}

addBodyHook("https://www.crunchyroll.com/content/v2/cms/objects/(.+)", (body) => {
    let obj = JSON.parse(body);

    if(obj.data[0].episode_metadata === undefined) return body;

    episode_information.currentEpisode = obj.data[0]

    if(episode_information.nextEpisode !== undefined)
        window.postMessage({
            type: "episode_information",
            value: episode_information
        })

    return body;
})

addBodyHook("https://www.crunchyroll.com/content/v2/discover/up_next/(.+)", (body) => {
    if(!window.location.href.startsWith("https://www.crunchyroll.com/watch/")) return body;
    episode_information.nextEpisode = JSON.parse(body).data[0];

    if(episode_information.currentEpisode !== undefined)
        window.postMessage({
            type: "episode_information",
            value: episode_information
        })

    return body;
})

// Skip Events
var skip_events = {};

addBodyHook("https://static.crunchyroll.com/datalab-intro-v2/(.+)", (body) => {
    skip_events.intro = {
        type: "intro",
        start: body.startTime,
        end: body.endTime,
    }

    skip_events.mediaId = body.media_id

    window.postMessage({
        type: "skip_events",
        value: skip_events
    });

    return body;
})

addBodyHook("https://static.crunchyroll.com/skip-events/production/(.+)", (body) => {
    var intro = skip_events.intro;
    skip_events = body;
    if(skip_events.intro === undefined || skip_events.intro.end === null) skip_events.intro = intro;

    window.postMessage({
        type: "skip_events",
        value: skip_events
    });

    body = skip_events;

    return body;
})

// Subtitles
addBodyHook("https://v.vrv.co/evs3/(.+)/assets/(.+)", (body) => {
    console.log(body);
    return body;
})