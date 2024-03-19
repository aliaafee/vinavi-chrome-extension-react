import React, { useEffect, useState, useContext } from "react";

import "../../../styles.css";

import VinaviApi from "../../../api/VinaviApi";
import EpisodeBrowser from "./EpisodeBrowser";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";
import AuthContext from "./AuthContext";

function ToolBar({ patient, auth }) {
    const onNewWindow = () => {
        const url = patient
            ? `popup.html#/patients/${patient.data.id}`
            : `popup.html`;
        chrome.windows.create(
            {
                url: chrome.runtime.getURL(url),
                type: "popup",
            },
            (window) => {
                window.location = "Yo";
            }
        );
    };

    console.log(auth);

    return (
        <div className="items-center top-0 left-0 fixed flex justify-end w-full gap-4 pr-1.5">
            <div className="flex items-center gap-1.5 px-1.5 py-1.5 rounded-b-md bg-gray-300">
                <div className="user bg-black"></div>
                {auth.user.data.attributes.full_name}
            </div>
            <button
                onClick={onNewWindow}
                title="Open New Window"
                className="new-window bg-black"
                style={{
                    left: "calc(100% - 48px)",
                }}
            ></button>
        </div>
    );
}

export default function PatientSearch() {
    const auth = useContext(AuthContext);
    const [patient, setPatient] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);

    useEffect(() => {
        (async () => {
            setError(null);
            try {
                setLoading(true);

                const currentPatientId = await VinaviApi.getCurrentPatientId();

                if (currentPatientId !== null) {
                    const currentPatient = await VinaviApi.getPatient(
                        currentPatientId
                    );
                    setPatient(currentPatient);
                }
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const onSearch = async (event) => {
        setSearchError(null);
        try {
            setIsSearching(true);

            const patientSearchResult =
                await VinaviApi.searchPatientByNationalIdentification(
                    searchText
                );

            const currentPatient = await VinaviApi.getPatient(
                patientSearchResult.data.id
            );

            setPatient(currentPatient);
        } catch (error) {
            setSearchError(error);
        } finally {
            setIsSearching(false);
        }
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorMessage title="Error" message={error.message} />;
    }

    if (patient) {
        return (
            <div className="w-full h-full flex flex-col">
                <EpisodeBrowser patient={patient} />
                <ToolBar patient={patient} auth={auth} />
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
            <ToolBar auth={auth} />
        </div>
    );
}
