import log from "../../shared/library/log.js";
import { dispatch } from "../redux/index.js";
import { setAuthToken as setDropboxAuthToken } from "../../shared/actions/dropbox.js";
import { setAuthToken as setMyButtercupAuthToken } from "../../shared/actions/myButtercup.js";
import { MYBUTTERCUP_CALLBACK_URL } from "../../shared/library/myButtercup.js";

const BUTTERCUP_DOMAIN_REXP = /^https:\/\/buttercup.pw\//;
const DROPBOX_ACCESS_TOKEN_REXP = /access_token=([^&]+)/;
const MYBUTTERCUP_ACCESS_TOKEN_REXP = /access_token=([^&]+)/;

export function attachBrowserStateListeners() {
    chrome.tabs.onUpdated.addListener(handleTabUpdatedEvent);
}

function handleTabUpdatedEvent(tabID, changeInfo) {
    // This event: https://developer.chrome.com/extensions/tabs#event-onUpdated
    const { url } = changeInfo;
    if (BUTTERCUP_DOMAIN_REXP.test(url)) {
        const accessTokenMatch = url.match(DROPBOX_ACCESS_TOKEN_REXP);
        if (accessTokenMatch) {
            const token = accessTokenMatch[1];
            log.info(`Retrieved Dropbox access token from tab: ${tabID}`);
            dispatch(setAuthToken(token));
            chrome.tabs.remove(tabID);
        }
    } else if (url && url.indexOf(MYBUTTERCUP_CALLBACK_URL) === 0) {
        const accessTokenMatch = url.match(MYBUTTERCUP_ACCESS_TOKEN_REXP);
        if (accessTokenMatch) {
            const token = accessTokenMatch[1];
            log.info(`Retrieved MyButtercup access token from tab: ${tabID}`);
            dispatch(setMyButtercupAuthToken(token));
            chrome.tabs.remove(tabID);
        }
    }
}
