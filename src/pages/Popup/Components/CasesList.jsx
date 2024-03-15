import React, { useEffect, useState } from "react";

import "../../../styles.css";

import VinaviApi from "../../../api/VinaviApi";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";

export default function CasesList({
    patientId,
    selectedEpisodeId,
    onEpisodeSelected,
    className = "",
    style = {},
}) {
    const [filterText, setFilterText] = useState("");
    const [cases, setCases] = useState(null);
    const [filteredCases, setFilteredCases] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setLoading] = useState(false);

    useEffect(() => {
        if (patientId === null) {
            return;
        }

        (async () => {
            setError(null);
            try {
                setLoading(true);

                const loadedCases = await VinaviApi.getAllCases(patientId);

                setCases(loadedCases.data);
                setFilteredCases(loadedCases.data);
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        })();
    }, [patientId]);

    useEffect(() => {
        if (filterText === "") {
            return;
        }

        const newFilteredCases = cases.filter((patientCase) => {
            return patientCase.relationships.episodes.data.reduce(
                (accumulator, episode) => {
                    const name =
                        patientCase.relationships.doctor.data.attributes
                            .fullname;
                    return (
                        accumulator ||
                        episode.relationships.doctor.data.attributes.fullname
                            .toUpperCase()
                            .includes(filterText.toUpperCase()) ||
                        episode.attributes.created_at.includes(filterText)
                    );
                },
                false
            );
        });

        setFilteredCases(newFilteredCases);
    }, [filterText]);

    if (isLoading) {
        return (
            <div className={className} style={style}>
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className={className} style={style}>
                <ErrorMessage title="Error" message={error.message} />
            </div>
        );
    }

    if (!filteredCases) {
        return <div className={className}>No Episodes</div>;
    }

    const liClassName = (episodeId) =>
        [
            "flex flex-col rounded-md cursor-pointer divide-solid divide-y divide-x-0",
            selectedEpisodeId === episodeId
                ? "bg-red-300 divide-black"
                : "bg-gray-100 hover:bg-red-100 divide-gray-300",
        ].join(" ");

    const parseDoctorFullName = (episode) => {
        if (
            "relationships" in episode &&
            "doctor" in episode.relationships &&
            "data" in episode.relationships.doctor &&
            "attributes" in episode.relationships.doctor.data &&
            "fullname" in episode.relationships.doctor.data.attributes
        ) {
            return episode.relationships.doctor.data.attributes.fullname;
        }
        console.log(episode);
        return "?";
    };

    return (
        <div className="flex flex-col bg-gray-200" style={style}>
            <div className="px-1.5 pt-1.5 pb-0 font-bold bg-gray-300">
                Episodes
            </div>
            <div className="flex flex-col p-1.5 bg-gray-300">
                <input
                    placeholder="Filter"
                    value={filterText}
                    onChange={(event) => {
                        setFilterText(event.target.value);
                    }}
                    className="p-1.5 rounded-md border-0 focus:outline-2 focus:outline-red-300"
                />
            </div>
            <div className="overflow-y-auto overflow-x-hidden ">
                <ul className="list-none m-0 p-1.5 flex flex-col gap-1.5">
                    {filteredCases.map((caseItem, caseIndex) =>
                        caseItem.relationships.episodes.data.map(
                            (episode, episodeIndex) => (
                                <li
                                    key={episodeIndex}
                                    onClick={() => onEpisodeSelected(episode)}
                                    className={liClassName(episode.id)}
                                >
                                    <div className="rounded-t-md p-1.5">
                                        {episode.attributes.created_at}
                                    </div>
                                    <div className="rounded-b-md font-bold p-1.5">
                                        Dr. {parseDoctorFullName(episode)}
                                    </div>
                                </li>
                            )
                        )
                    )}
                </ul>
            </div>
        </div>
    );
}
