import React, { useEffect, useState, useContext, useMemo } from "react";
import {
    SquareArrowOutUpRight,
    // User,
    ArrowLeft,
    RefreshCcw,
    CopyPlusIcon,
} from "lucide-react";

import {
    getPatient,
    searchPatientByNationalIdentification,
} from "../api/VinaviApi";
import EpisodeBrowser from "./episode-browser";
import LoadingSpinner from "./loading-spinner";
import ErrorMessage from "./error-message";
// import AuthContext from "./auth-context";
import { ActiveTabContext } from "./active-tab-context";

function getUrlParams() {
    const queryString = window.location.search;
    return new URLSearchParams(queryString);
}

function ToolBar({
    patient,
    onBackButtonClick = null,
    onSyncButtonClick = null,
}) {
    // const auth = useContext(AuthContext);
    const activeTab = useContext(ActiveTabContext);
    const isPopUpWindw = useMemo(() => !getUrlParams().has("tabid"));

    const onNewWindow = () => {
        const url = `popup.html${activeTab.id ? `?tabid=${activeTab.id}` : ""}${
            patient ? `#/patients/${patient.data.id}` : ""
        }`;
        chrome.windows.create(
            {
                url: chrome.runtime.getURL(url),
                type: "popup",
            },
            (window) => {
                window.location = "Yo";
            }
        );
        if (isPopUpWindw) {
            window.close();
        }
    };

    return (
        <div className="items-center top-0 left-0 fixed flex justify-end w-full gap-4">
            {/* <div className="flex items-center gap-1.5 px-1.5 py-1.5 rounded-b-md bg-gray-300">
                <User size={16} color="black" />
                {auth.user.data.attributes.full_name}
            </div> */}
            <div className="flex gap-1.5 pr-1">
                {onBackButtonClick && (
                    <button
                        onClick={onBackButtonClick}
                        title="Back To Patient Search"
                        className="p-1.5 rounded-full hover:bg-gray-300"
                    >
                        <ArrowLeft size={16} color="black" />
                    </button>
                )}
                {activeTab.id && onSyncButtonClick && (
                    <button
                        onClick={onSyncButtonClick}
                        title="Load Active Patient"
                        className="p-1.5 rounded-full hover:bg-gray-300"
                    >
                        <RefreshCcw size={16} color="black" />
                    </button>
                )}
                <button
                    onClick={onNewWindow}
                    title="Open New Window"
                    className="p-1.5 rounded-full hover:bg-gray-300"
                >
                    {isPopUpWindw ? (
                        <SquareArrowOutUpRight size={16} color="black" />
                    ) : (
                        <CopyPlusIcon size={16} color="black" />
                    )}
                </button>
            </div>
        </div>
    );
}

export default function PatientSearch() {
    const activeTab = useContext(ActiveTabContext);
    const [patient, setPatient] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [statusMessage, setStatusMessage] = useState("");

    useEffect(() => {
        (async () => {
            setError(null);
            try {
                setLoading(true);

                const currentPatientId = await getCurrentPatientId();

                if (currentPatientId !== null) {
                    const currentPatient = await getPatient(currentPatientId);
                    setPatient(currentPatient);
                }
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const getCurrentPatientId = async () => {
        //Fist try to get patientId from PopupUrl
        setStatusMessage("Checking Popup URL");
        const patientIdMatch = window.location.href.match(/\/patients\/(\d+)/);

        if (patientIdMatch) {
            return patientIdMatch[1];
        }

        if (!activeTab.id) {
            return null;
        }

        // Next try to get patientId from active tab
        return getPatientIdFromTab(activeTab.id);
    };

    const getPatientIdFromTab = async (tabid) => {
        // Try to look for patient national id in tab of the emr
        setStatusMessage("Checking Page Content");
        try {
            const injectionResult = await chrome.scripting.executeScript({
                target: { tabId: tabid },
                func: () => {
                    if (!window.location.href.includes("hinai")) {
                        return null;
                    }

                    const infoElement = document.getElementById("patientFlag");
                    if (!infoElement) {
                        return null;
                    }

                    const nidElement = infoElement.childNodes[3];
                    const nid = nidElement.innerText;

                    return nid;
                },
            });

            if (injectionResult) {
                const patientNationalId = injectionResult[0].result;
                if (patientNationalId) {
                    const currentPatient =
                        await searchPatientByNationalIdentification(
                            patientNationalId
                        );
                    return currentPatient.data.id;
                }
            }
        } catch (error) {
            return null;
        }

        //Next try to get the patientid from the url of vinavi
        setStatusMessage("Checking Page URL");
        try {
            const tab = await chrome.tabs.get(tabid);

            const patientIdMatch2 = tab.url.match(/\/patients\/(\d+)/);

            if (patientIdMatch2) {
                return patientIdMatch2[1];
            }
        } catch (error) {
            return null;
        }

        return null;
    };

    const onSearch = async (event) => {
        setSearchError(null);
        try {
            setIsSearching(true);

            const patientSearchResult =
                await searchPatientByNationalIdentification(searchText);

            const currentPatient = await getPatient(
                patientSearchResult.data.id
            );

            setPatient(currentPatient);
        } catch (error) {
            setSearchError(error);
        } finally {
            setSearchText("");
            setIsSearching(false);
        }
    };

    const onSync = async (event) => {
        setError(null);
        try {
            setLoading(true);
            const currentPatientId = await getPatientIdFromTab(activeTab.id);

            if (currentPatientId !== null) {
                const currentPatient = await getPatient(currentPatientId);
                setPatient(currentPatient);
            } else {
                setPatient(null);
            }
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    if (isLoading) {
        return <LoadingSpinner message={statusMessage} />;
    }

    if (error) {
        return <ErrorMessage title="Error" message={error.message} />;
    }

    if (patient) {
        return (
            <div className="w-full h-full flex flex-col">
                <EpisodeBrowser patient={patient} />
                <ToolBar
                    patient={patient}
                    onBackButtonClick={() => {
                        setPatient(null);
                        setSearchText("");
                    }}
                    onSyncButtonClick={onSync}
                />
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="logo w-48 h-48"></div>
            <div className="drop-shadow-md flex p-2 gap-2 bg-gray-300 rounded-md">
                <input
                    placeholder="Patient Identification"
                    value={searchText}
                    onChange={(event) => {
                        setSearchText(event.target.value);
                    }}
                    onKeyUp={(event) => {
                        if (event.key === "Enter") {
                            onSearch();
                        }
                    }}
                    className="p-1.5 rounded-md border-0 focus:outline-2 focus:outline-red-300"
                />
                <button
                    onClick={onSearch}
                    className="w-12 p-1.5 rounded-md bg-red-300 border-0 focus:outline-2 focus:outline-red-300 hover:bg-red-400"
                >
                    {isSearching ? <LoadingSpinner size="small" /> : "Go"}
                </button>
            </div>
            <div className="p-1.5">
                {searchError ? (
                    searchError.cause ? (
                        searchError.cause.status === 404 ? (
                            "Patient not found"
                        ) : (
                            searchError.message
                        )
                    ) : (
                        searchError.message
                    )
                ) : (
                    <br />
                )}
            </div>
            <ToolBar onSyncButtonClick={onSync} />
        </div>
    );
}
