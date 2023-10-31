const END_MINUTE = 3;

var info = {};
var container;

var port = chrome.runtime.connect({name: "player"});
port.onMessage.addListener(async (request) => {
    switch(request.type) {
        case "episode_information":
            if(info.currentEpisode !== undefined && info.currentEpisode.episode_metadata.series_id !== request.value.currentEpisode.episode_metadata.series_id) break;
            info = request.value;
            break;
        case "skip_events":
            if(info.skipEvents !== undefined) break;
            info.skipEvents = request.value;
            break;
    }
});

function skipButton(video, title, end) {
    var btn = document.createElement("div");

    btn.style.display = "block";
    btn.style.paddingTop = "10px";
    btn.style.paddingBottom = "10px";
    btn.style.paddingLeft = "10px";
    btn.style.paddingRight = "15px";
    btn.style.backgroundColor = "rgb(35,37,43)";
    btn.style.position = "absolute";

    var text = document.createElement("div");
    text.dir = "auto";
    text.classList.add("css-901oao");
    text.classList.add("r-jwli3a");
    text.classList.add("r-15lhr44");
    text.style.fontSize = "14px";
    text.style.fontWeight = "800";
    text.style.letterSpacing = "0px";
    text.style.lineHeight = "18px";
    text.style.marginLeft = "8px";
    text.innerText = `SKIP ${title.toUpperCase()}`;

    btn.appendChild(text);

    btn.addEventListener("click", function() {
        video.pause();
        video.currentTime = end;
        video.play(); 
    });

    container.appendChild(btn);

    let dimensions = document.querySelector(".css-1dbjc4n.r-1awozwy.r-1p0dtai.r-1777fci.r-633pao.r-u8s1d.r-13qz1uu").getBoundingClientRect();
    let divDim = btn.getBoundingClientRect();

    console.log(btn);

    btn.style.top = `${~~(dimensions.top + window.scrollY - dimensions.height * 2 - divDim.height)}px`;
    btn.style.left = `${~~(dimensions.width - divDim.width - 25)}px`
}

function onenter() {
    container = document.createElement("div");

    container.tabIndex = 0;
    container.style.width = "100%";
    container.style.height = "auto";

    document.querySelector("#vilosControlsContainer").appendChild(container);
    var video = document.querySelector("video");

    // Title
    if(document.fullscreenElement !== null) {
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

    // Skip events, since CR hasn't done it on the browser yet.
    if(info.skipEvents) {
        const { credits, preview, recap } = info.skipEvents;
        let isShown;

        function runEvent(event) {
            if(isShown && document.querySelector("div[data-testid='skipButton']") !== null) return;
            if(event.end !== null && event.start !== null) {
                if(video.currentTime < event.end && video.currentTime >= event.start) {
                    skipButton(video, event.type, event.end);
                    isShown = true;
                }
            }
        }

        runEvent(credits);
        runEvent(preview);
        runEvent(recap);
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
    container.remove();
    container = undefined;
}

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