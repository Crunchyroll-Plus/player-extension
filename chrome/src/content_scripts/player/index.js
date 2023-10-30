const END_MINUTE = 3;

var info = {};
var container;

var port = chrome.runtime.connect({name: "player"});
port.onMessage.addListener(async (request) => {
    if(request.type !== "episode_information") return;
    if(info.currentEpisode !== undefined && info.currentEpisode.episode_metadata.series_id !== request.value.currentEpisode.episode_metadata.series_id) return;

    info = request.value;
});

function onenter() {
    container = document.createElement("div");

    container.style.width = "100%";
    container.style.height = "auto";

    document.querySelector("#vilosControlsContainer").appendChild(container);
    // var video = document.querySelector("video");

    if(document.fullscreenElement !== null) {
        var episode = info.currentEpisode;

        season_title = (season_title = container.querySelector(".season_title")) === null ? document.createElement("h1") : season_title;        
        season_title.classList.add("season_title")
        season_title.style.position = "absolute"
        season_title.style.top = "-15px"
        season_title.style.textAlign = "center"
        season_title.style.width = "100%"
        season_title.style.fontSize = "32px"
        season_title.style.fontFamily = "'Lato', sans-serif"
        season_title.style.color = "rgb(255, 255, 255)";
        season_title.style.textShadow = "2px 2px 2px black";
        season_title.style.fontWeight = "700"
        season_title.innerText = episode.episode_metadata.season_title;

        title = (title = container.querySelector(".title")) === null ? document.createElement("h2") : title;
        title.classList.add("title")
        title.style.position = "absolute"
        title.style.top = "24px"
        title.style.textAlign = "center"
        title.style.width = "100%"
        title.style.fontSize = "26px"
        title.style.textShadow = "2px 2px 2px black";
        title.style.color = "rgb(235, 235, 235)";
        title.style.fontFamily = "'Lato', sans-serif"
        season_title.style.fontWeight = "500"
        title.innerText = `E${episode.episode_metadata.episode} - ${episode.title}`;

        container.appendChild(season_title);
        container.appendChild(title);
    }

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