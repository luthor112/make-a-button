import { findModule, DialogButton, Millennium } from "@steambrew/client";
import { render } from "preact";

const WaitForElement = async (sel: string, parent = document) =>
	[...(await Millennium.findElement(parent, sel))][0];

const WaitForElementTimeout = async (sel: string, parent = document, timeOut = 1000) =>
	[...(await Millennium.findElement(parent, sel, timeOut))][0];

const WaitForElementList = async (sel: string, parent = document) =>
	[...(await Millennium.findElement(parent, sel))];

async function sleep(msec) {
    return new Promise(resolve => setTimeout(resolve, msec));
}

async function OnPopupCreation(popup: any) {
    if (popup.m_strName === "SP Desktop_uid0") {
        var mwbm = undefined;
        while (!mwbm) {
            console.log("[make-a-button] Waiting for MainWindowBrowserManager");
            try {
                mwbm = MainWindowBrowserManager;
            } catch {
                await sleep(100);
            }
        }

        MainWindowBrowserManager.m_browser.on("finished-request", async (currentURL, previousURL) => {
            if (MainWindowBrowserManager.m_lastLocation.pathname.startsWith("/library/app/")) {
                const gameSettingsButton = await WaitForElement(`div.${findModule(e => e.InPage).InPage} div.${findModule(e => e.AppButtonsContainer).AppButtonsContainer} > div.${findModule(e => e.MenuButtonContainer).MenuButtonContainer}:not([role="button"])`, popup.m_popup.document);

                console.log("[make-a-button] Creating button by cloning...");
                const clonedButton = gameSettingsButton.cloneNode(true);
                clonedButton.firstChild.innerHTML = "BTN1";
                gameSettingsButton.parentNode.insertBefore(clonedButton, gameSettingsButton.nextSibling);

                console.log("[make-a-button] Creating button by rendering...");
                const renderedButton = popup.m_popup.document.createElement("div");
                render(<DialogButton>BTN2</DialogButton>, renderedButton);
                gameSettingsButton.parentNode.insertBefore(renderedButton, gameSettingsButton.nextSibling);
            }
        });
    }
}

export default async function PluginMain() {
    console.log("[make-a-button] Frontend startup");

    const doc = g_PopupManager.GetExistingPopup("SP Desktop_uid0");
	if (doc) {
		OnPopupCreation(doc);
	}

	g_PopupManager.AddPopupCreatedCallback(OnPopupCreation);
}
