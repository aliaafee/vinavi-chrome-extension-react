import React, { useEffect, useState } from "react";

import "../../../styles.css";

import { getAllCases } from "../../../api/VinaviApi";
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

                const loadedCases = await getAllCases(patientId);

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
            setFilteredCases(cases);
            return;
        }

        // const newFilteredCases = cases.filter((patientCase) => {
        //     return patientCase.relationships.episodes.data.reduce(
        //         (accumulator, episode) => {
        //             try {
        //                 const name =
        //                     patientCase.relationships.doctor.data.attributes
        //                         .fullname;
        //                 return (
        //                     accumulator ||
        //                     episode.relationships.doctor.data.attributes.fullname
        //                         .toUpperCase()
        //                         .includes(filterText.toUpperCase()) ||
        //                     episode.attributes.created_at.includes(filterText)
        //                 );
        //             } catch (error) {
        //                 return accumulator;
        //             }
        //         },
        //         false
        //     );
        // });

        const newFilteredCases = cases.filter((patientCase) => {
            try {
                return (
                    patientCase.relationships.doctor.data.attributes.fullname
                        .toUpperCase()
                        .includes(filterText.toUpperCase()) ||
                    patientCase.attributes.created_at.includes(filterText)
                );
            } catch (error) {
                return false;
            }
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
            "flex flex-col rounded-md cursor-pointer",
            selectedEpisodeId === episodeId
                ? "bg-red-300"
                : "bg-gray-100 hover:bg-red-100",
        ].join(" ");

    const parseDoctorFullName = (item) => {
        if (
            "relationships" in item &&
            "doctor" in item.relationships &&
            "data" in item.relationships.doctor &&
            "attributes" in item.relationships.doctor.data &&
            "fullname" in item.relationships.doctor.data.attributes
        ) {
            return item.relationships.doctor.data.attributes.fullname;
        }
        console.log(item);
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
                                    <div className="rounded-t-md px-1.5 pt-1.5">
                                        {caseItem.attributes.created_at}
                                    </div>
                                    <div className="rounded-b-md font-bold px-1.5 pb-1.5">
                                        Dr. {parseDoctorFullName(caseItem)}
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
