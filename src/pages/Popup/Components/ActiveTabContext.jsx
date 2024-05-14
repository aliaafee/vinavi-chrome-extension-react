import React, { createContext, useEffect, useState } from "react";

import { getActiveTab } from "../../../api/VinaviApi";
import LoadingSpinner from "./LoadingSpinner";

const ActiveTabContext = createContext({ tabid: null });

const getActiveTabId = async () => {
    try {
        const queryString = window.location.search;

        const urlParams = new URLSearchParams(queryString);

        if (urlParams.has("tabid")) {
            const tabId = Number(urlParams.get("tabid"));
            const tab = await chrome.tabs.get(tabId);

            return tab.id;
        }

        const activeTab = await getActiveTab();

        // if (!activeTab.url.includes(VinaviApi.apiServer)) {
        //     return null;
        // }

        return activeTab.id;
    } catch (Error) {
        return null;
    }
};

const ActiveTabContextProvider = ({ children }) => {
    const [isLoading, setLoading] = useState(false);
    const [activeTabId, setActiveTabId] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const tabId = await getActiveTabId();
                setActiveTabId(tabId);
            } catch (error) {
                setActiveTabId(null);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <ActiveTabContext.Provider value={{ id: activeTabId }}>
            {children}
        </ActiveTabContext.Provider>
    );
};

export { ActiveTabContext, ActiveTabContextProvider };
