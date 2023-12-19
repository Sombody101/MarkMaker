const DEBUG = true;
const extensionTag = "MarkMaker:";

const aboutMeSelector =
    "#profile-content > div > div.scaffold-layout.scaffold-layout--breakpoint-xl.scaffold-layout--main-aside.scaffold-layout--reflow.pv-profile.pvs-loader-wrapper__shimmer--animate > div > div > main > section:nth-child(4) > div.display-flex.ph5.pv3 > div > div > div > span:nth-child(1)";

function loadCssFor(mode) {
    const elmName = "MARK-MAKER-CSS";

    const existingElement = document.getElementById(elmName);

    if (existingElement) {
        existingElement.remove();
    }

    const uiLink = document.createElement("link");
    uiLink.rel = "stylesheet";
    uiLink.type = "text/css";
    uiLink.href = chrome.runtime.getURL(`/extras/github-markdown-${mode}.css`);
    uiLink.id = elmName;

    document.head.appendChild(uiLink);
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

    // Match the pattern "git@<branch><separator><profile>"
    const match = username.match(/^git@([^@\s]+)[^\w\s]([^@\s]+)$/);

    if (match) {
        const branch = match[1] || "main"; // Use 'main' if no branch is supplied
        const profile = match[2];
        url = `https://raw.githubusercontent.com/${profile}/${profile}/${branch}/README.md`;
    } else {
        url = username;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch README.md for ${username}`);
        }

        const markdownContent = await response.text();
        const htmlContent = marked.parse(markdownContent);
        innerHTML = `<div id="markdown-content" class="markdown-body"> ${htmlContent} </div>`;

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

        const iframe = document.createElement("iframe");
        iframe.onload = function () {
            iframe.style.height =
                iframe.contentWindow.document.body.scrollHeight + "px";
        };

        iframe.src = getGeneratedPageURL({
            html: innerHTML,
            css: chrome.runtime.getURL(
                `/extras/github-markdown-${
                    document.querySelector(".theme-dark") !== null
                        ? "dark"
                        : "light"
                }.css`
            ),
        });
        
        iframe.id = "#iframe";
        iframe.style =
            "border-radius: 10px; width: 100%; height: fit-content; border: none;";
        iframe.scroll = "no";
        aboutMeSection.innerHTML = "";
        aboutMeSection.appendChild(iframe);

        document
            .querySelector(
                "#profile-content > div > div.scaffold-layout.scaffold-layout--breakpoint-xl.scaffold-layout--main-aside.scaffold-layout--reflow.pv-profile.pvs-loader-wrapper__shimmer--animate > div > div > main > section:nth-child(4) > div.display-flex.ph5.pv3 > div > div > div > span.inline-show-more-text__link-container-collapsed"
            )
            .remove();

        // Load GitHub (Look alike) CSS
    } catch (error) {
        console.warn(`Error fetching or parsing Markdown [${url}]:`, error);
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

            await loadReadme(markdownURL);
        } else {
            console.warn("Failed to locate about me section with path");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

getAboutMeSection();

// Function to handle changes in the DOM
function handleMutations(mutationsList, observer) {
    if (!aboutMeSection) return;

    // Set a timeout to execute injectCSS after 200ms
    for (const mutation of mutationsList) {
        if (mutation.type === "childList") {
            mutation.addedNodes.forEach((node) => {
                // Check if the added node is a link element or a style element
                if (
                    (node.id &&
                        !node.id.startsWith("MARK") &&
                        node instanceof HTMLLinkElement &&
                        node.rel === "stylesheet") ||
                    (node instanceof HTMLStyleElement &&
                        node.type === "text/css")
                ) {
                    // A new CSS file or style element was added, reload your styles
                    clearTimeout(200);
                    console.log("starting timeout...");

                    timeoutId = setTimeout(() => {
                        console.log("reloading css");
                        if (document.querySelector(".theme-dark") !== null)
                            loadCssFor("dark");
                        else loadCssFor("light");
                    }, 50);
                }
            });
        }
    }
}

// Create a MutationObserver and attach it to the document
const observer = new MutationObserver(handleMutations);
const observerConfig = { childList: true, subtree: true };
observer.observe(document, observerConfig);
