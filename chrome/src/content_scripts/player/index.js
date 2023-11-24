const END_MINUTE = 3;

var info = {};
var container;
var state = "idle";
var video;

var port = chrome.runtime.connect({name: "player"});
var counter = 0;

portListener = async (request) => {
    // console.log(request);
    switch(request.type) {
        case "episode_information":
            // if(info.currentEpisode !== undefined) break;
            info.currentEpisode = request.value.currentEpisode;
            break;
        case "skip_events":
            info.skipEvents = request.value;
            break;
    }
}

port.onMessage.addListener(portListener);

function createContainer() {
    state = "open";
    container = container !== undefined ? container : document.createElement("div");
    container.tabIndex = 0;
    container.style.width = "100%";
    container.style.height = "auto";
    document.querySelector("#vilosControlsContainer").appendChild(container);
}

function onenter() {
    // console.log(document.documentElement)
    try { port.disconnect(); } catch (e) {}
    port = chrome.runtime.connect({name: "player"});
    port.onMessage.addListener(portListener);

    createContainer();
    skipEventsHandler();

    // Title
    if(document.fullscreenElement !== null && info.currentEpisode !== undefined) {
        var episode = info.currentEpisode;

        title = (title = container.querySelector(".title")) === null ? document.createElement("h1") : title;
        title.classList.add("title")
        title.style.position = "absolute"
        title.style.top = "-10px"
        title.style.textAlign = "center"
        title.style.width = "100%"
        title.style.fontSize = "32px"
        title.style.textShadow = "2px 2px 2px black";
        title.style.color = "rgb(235, 235, 235)";
        title.style.fontFamily = "'Lato', sans-serif"
        title.style.fontWeight = "700"
        title.innerText = `S${episode.episode_metadata.season_number} E${episode.episode_metadata.episode} - ${episode.title}`;

        container.appendChild(title);
    }
    // Next Episode Panel
    // if((video.duration - video.currentTime) / 60 <= END_MINUTE) {
        // var body = document.createElement("div");
        // var img = document.createElement("img");
        // var title = document.createElement("a");
        // var thumbnail = info.nextEpisode.panel.images.thumbnail[0].find(item => item.width >= 350 && item.height <= 450);

        // body.style.borderRadius = "5px";
        // body.style.position = "absolute";

        // img.style.borderRadius = "10px";

        // var height = 200;
        // var width = (thumbnail.width / thumbnail.height) * height;

        // body.style.width = `${width}px`;
        // body.style.height = `${height}px`;

        // let dimensions = document.querySelector(".css-1dbjc4n.r-1awozwy.r-1p0dtai.r-1777fci.r-633pao.r-u8s1d.r-13qz1uu").getBoundingClientRect();
        // body.style.top = `${~~(dimensions.top + window.scrollY - dimensions.height * 2 - width / 2 - 23)}px`;
        // body.style.left = `${~~(dimensions.right - width - 25)}px`

        // img.style.width = "100%";
        // img.style.height = "100%";

        // img.src = thumbnail.source;

        // body.appendChild(title);
        // body.appendChild(img);

        // container.appendChild(body);
    // }
}

function onleave() {
    state = "idle";
    container.remove();
    container = undefined;
}



function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                observer.disconnect();
                resolve(document.querySelector(selector));
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}



function skipButton(title, end) {
    createContainer();

    var btn = container.querySelector(".skipEventButton")
    if(btn !== null) btn.remove();

    if(lastShown !== title) {
        setTimeout(() => {
            if(state === "open") return;
            container.remove();
            container = undefined;
        }, 1000);
    }

    var skipIcon = document.createElement("img");

    skipIcon.src = "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23FFF%22%3E%3Cg%3E%3Cg%3E%3Cg%3E%3Cpath%20d%3D%22M23%205v14h-2v-6.364L11%2019V5l10%206.364V5h2z%22%20transform%3D%22translate(-153%20-905)%20translate(120%20881)%20translate(17%2016)%20translate(16%208)%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M1%205L1%2019%2012%2012z%22%20transform%3D%22translate(-153%20-905)%20translate(120%20881)%20translate(17%2016)%20translate(16%208)%22%3E%3C%2Fpath%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E";
    skipIcon.style.width = "24px";
    skipIcon.style.height = "24px";

    btn = document.createElement("div");
    btn.className = "skipEventButton";
    btn.style.zIndex = "10";
    btn.style.display = "block";
    btn.style.paddingTop = "10px";
    btn.style.paddingBottom = "5px";
    btn.style.paddingLeft = "15px";
    btn.style.paddingRight = "15px";
    btn.tabIndex = "1";
    btn.style.backgroundColor = "rgb(35,37,43)";
    btn.style.position = "absolute";

    var text = document.createElement("div");
    text.dir = "auto";
    text.style.position = "relative";
    text.style.top = "-6.5px";
    text.style.marginLeft = "4px";
    text.classList.add("css-901oao");
    text.classList.add("r-jwli3a");
    text.classList.add("r-15lhr44");
    text.style.fontSize = "14px";
    text.style.fontWeight = "800";
    text.style.letterSpacing = "0px";
    text.style.lineHeight = "18px";
    text.style.marginLeft = "8px";
    text.innerText = `SKIP ${title.toUpperCase()}`;

    btn.appendChild(skipIcon);
    btn.appendChild(text);

    btn.addEventListener("click", function() {
        var video = document.querySelector("video");
        video.currentTime = end;

        setTimeout(() => {
            if(!video.paused)
                video.play();
            lastShown = undefined;
        }, 100);

        btn.remove();
    });

    container.appendChild(btn);
    
    let dimensions = document.querySelector(".css-1dbjc4n.r-1awozwy.r-1p0dtai.r-1777fci.r-633pao.r-u8s1d.r-13qz1uu").getBoundingClientRect();
    let divDim = btn.getBoundingClientRect();

    btn.style.top = `${~~(dimensions.top + window.scrollY - dimensions.height * 2 - divDim.height)}px`;
    btn.style.left = `${~~(dimensions.width - divDim.width - 25)}px`
}

var lastShown;

function skipEventsHandler(handler_type) {
    if(info.skipEvents) {
        const { intro, credits, preview, recap } = info.skipEvents;
        var isShown = false;

        function runEvent(event) {
            if(event === undefined || isShown === true || handler_type === "update" && lastShown === event.type || document.querySelector("div[data-testid='skipButton']") !== null ) return;
            if(event.end !== null && event.start !== null) {
                if(video.currentTime < event.end && video.currentTime >= event.start) {
                    isShown = true
                    skipButton(event.type, event.end, handler_type);
                    lastShown = event.type;
                }
            }
        }

        runEvent(intro);
        runEvent(credits);
        runEvent(preview);
        runEvent(recap);
    }
}

waitForElm("video").then(videoElm => {
    video = videoElm;
    video.addEventListener("timeupdate", () => skipEventsHandler("update"));
});

const observer = new MutationObserver((mutationList) => {
    for(const mutation of mutationList) {
        switch(mutation.type) {
            case "childList":
                if(!mutation.target.parentElement.classList.contains("r-13qz1uu")) break;
                if(mutation.addedNodes.length > 0 && container === undefined ) onenter(mutation.addedNodes[0])
                else if(mutation.removedNodes.length > 0 && container !== undefined) onleave(mutation.removedNodes[0]);
                break;
        }
    };
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

