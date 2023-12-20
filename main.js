const extensionTag = "MarkMaker:";

const aboutMeSelector =
    "#profile-content > div > div.scaffold-layout.scaffold-layout--breakpoint-xl.scaffold-layout--main-aside.scaffold-layout--reflow.pv-profile.pvs-loader-wrapper__shimmer--animate > div > div > main > section:nth-child(4) > div.display-flex.ph5.pv3 > div > div > div > span:nth-child(1)";

let previousAboutMe = "";
let currentUsername;
waitForElm("#ember37 > h1").then((elm) => {
    currentUsername = elm.innerText;
});

function revertAboutMe(error) {
    aboutMeSection.innerHTML = previousAboutMe || "";

    const errMsg = document.createElement("div");
    errMsg.innerHTML = `
    <div class="error-box">
        <div class="error-header">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path d="M13 17.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-.25-8.25a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 1.5 0v-4.5Z">
                </path>
                <path d="M9.836 3.244c.963-1.665 3.365-1.665 4.328 0l8.967 15.504c.963 1.667-.24 3.752-2.165 3.752H3.034c-1.926 0-3.128-2.085-2.165-3.752Zm3.03.751a1.002 1.002 0 0 0-1.732 0L2.168 19.499A1.002 1.002 0 0 0 3.034 21h17.932a1.002 1.002 0 0 0 .866-1.5L12.866 3.994Z">
                </path>
            </svg>
            <p>Failed to load ${currentUsername}'s markdown bio</p>
        </div>

        <div class="error-message-container">
            <p class="error-message">${error}</p>
        </div>
    </div>`;

    waitForElm(
        "#profile-content > div > div.scaffold-layout.scaffold-layout--breakpoint-xl.scaffold-layout--main-aside.scaffold-layout--reflow.pv-profile.pvs-loader-wrapper__shimmer--animate > div > div > main > section:nth-child(4) > div.YUTajPnnbAvYcJDaQOJReSFZlsGiPAEZIZiDpEY"
    ).then((elm) => {
        elm.appendChild(errMsg);
    });

    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("close-btn")) {
            errMsg.remove();
        }
    });
}

function getUserTheme() {
    return getComputedStyle(document.body).backgroundColor.replace(
        /\s/g,
        ""
    ) === "rgb(0,0,0)"
        ? "dark"
        : "light";
}

function waitForElm(selector) {
    return new Promise((resolve) => {
        const element = document.querySelector(selector);
        if (element) {
            resolve(element);
            return;
        }

        const observer = new MutationObserver((mutations) => {
            const updatedElement = document.querySelector(selector);
            if (updatedElement) {
                observer.disconnect();
                resolve(updatedElement);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    });
}

let aboutMeSection;

async function loadReadme(username) {
    let url;

    if (username.toLowerCase().startsWith("git@")) {
        let tmp = username.substring(4);
        let dat = tmp.split(">");

        if (dat.length == 2) {
            url = `https://raw.githubusercontent.com/${dat[1]}/${dat[1]}/${dat[0]}/README.md`;
        } else if (dat.length == 1) {
            url = `https://raw.githubusercontent.com/${dat[0]}/${dat[0]}/main/README.md`;
        } else {
            throw new Error("Invalid shorthand depth of " + dat.length);
        }
    } else if (username.toLowerCase() == "#test") {
        url =
            "https://raw.githubusercontent.com/Sombody101/Sombody101/main/MarkMakerTest.md";
    } else {
        url = username;
    }

    try {
        console.log(`Attempting markdown fetch for '${url}'`);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch README.md for ${username}`);
        }

        const markdownContent = await response.text();
        const htmlContent = marked.parse(markdownContent);
        innerHTML = `<div id="markdown-content" class="markdown-body">${htmlContent}</div>`;

        const getGeneratedPageURL = ({ html, css }) => {
            const getBlobURL = (code, type) => {
                const blob = new Blob([code], { type });
                return URL.createObjectURL(blob);
            };

            const source = `
              <html>
                <head>
                    ${
                        css &&
                        `<link rel="stylesheet" type="text/css" href="${css}" />`
                    }
                    <style>
                        body, html {
                          margin: 0;
                          padding: 0;
                          border-radius: 10px;
                        }
                        
                    	.markdown-body {
                    		box-sizing: border-box;
                    		min-width: 200px;
                    		max-width: 980px;
                    		margin: 0 auto;
                    		padding: 45px;
                    	}
                    
                    	@media (max-width: 767px) {
                    		.markdown-body {
                    			padding: 15px;
                    		}
                    	}
                    </style>

                </head>
                <body>
                  ${html || ""}
                </body>
              </html>
            `;

            return getBlobURL(source, "text/html");
        };

        let lastSize = 0;
        function resizeIFrame() {
            let winSize = iframe.contentWindow.document.body.scrollHeight + 10;

            if (winSize == lastSize) return;

            iframe.style.height = winSize + "px";
            lastSize = winSize + 10;
        }

        const iframe = document.createElement("iframe");
        iframe.onload = resizeIFrame;
        iframe.src = getGeneratedPageURL({
            html: innerHTML,
            css: chrome.runtime.getURL(
                `/extras/github-markdown-${getUserTheme()}.css`
            ),
        });

        iframe.id = "#iframe";
        iframe.style =
            "border-radius: 10px; width: 100%; height: fit-content; border: none;";
        iframe.scroll = "no";
        aboutMeSection.innerHTML = "";
        aboutMeSection.appendChild(iframe);

        setInterval(function () {
            resizeIFrame();
        }, 5000);
    } catch (error) {
        console.warn(`Error fetching or parsing Markdown [${url}]:`, error);
        revertAboutMe(error.message);
    }
}

async function getAboutMeSection() {
    console.log("Waiting for about me section to load...");
    try {
        const element = await waitForElm(aboutMeSelector);
        aboutMeSection = element;
        console.log("Found:", aboutMeSection);

        if (aboutMeSection && aboutMeSection.innerText.includes(extensionTag)) {
            const metadataLine = aboutMeSection.innerText
                .split("\n")
                .find((line) => line.includes(extensionTag));
            const markdownURL = metadataLine.split(extensionTag)[1].trim();

            previousAboutMe = aboutMeSection.innerHTML;
            aboutMeSection.innerHTML = `
            <div class="m-loader">
                <svg viewBox="25 25 50 50">
                    <circle r="20" cy="50" cx="50"></circle>
                </svg>
            </div>
            <p class="m-loader">
                Loading ${currentUsername}'s markdown...
            </p>
            `;

            waitForElm(
                "#profile-content > div > div.scaffold-layout.scaffold-layout--breakpoint-xl.scaffold-layout--main-aside.scaffold-layout--reflow.pv-profile.pvs-loader-wrapper__shimmer--animate > div > div > main > section:nth-child(4) > div.display-flex.ph5.pv3 > div > div > div > span.inline-show-more-text__link-container-collapsed"
            ).then((elm) => elm.remove());

            loadReadme(markdownURL);
        } else {
            console.warn("Failed to locate about me section with path");
        }
    } catch (error) {
        console.error("Error:", error);
        revertAboutMe(error.message);
    }
}

getAboutMeSection();
