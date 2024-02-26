import React, { useState } from "react";

import "../../../styles.css";

import CasesList from "./CasesList";
import EpisodeDetail from "./EpisodeDetail";

export default function EpisodeBrowser({ patient }) {
    const [selectedEpisodeId, setSelectedEpisodeId] = useState(null);

    const headerHeight = "86px";
    const sidebarWidth = "200px";

    const onEpisodeSelected = (episode) => {
        setSelectedEpisodeId(episode.id);
    };

    const getAge = (dateOfBirth) => {
        const diff_ms = Date.now() - dateOfBirth;
        const years = diff_ms / 1000 / 3600 / 24 / 365;
        const months = (years % 1) * 12;
        if (years < 1) {
            return `${Math.floor(months)} months`;
        }
        return `${Math.floor(years)} years ${Math.floor(months)} months`;
    };

    if (!patient) {
        return <div>No patient selected</div>;
    }

    return (
        <div className="flex flex-col">
            <div className="fixed bg-gray-200 grid grid-cols-2 w-screen gap-1.5 p-1.5">
                <div className="col-span-2 text-lg">
                    {patient.data.attributes.patient_name}
                </div>
                <div>
                    {getAge(new Date(patient.data.attributes.birth_date))}
                </div>
                <div className="capitalize">
                    {patient.data.attributes.gender}
                </div>
                <div>{patient.data.attributes.national_identification}</div>
                <div>Birth Date {patient.data.attributes.birth_date}</div>
            </div>
            <div className="">
                <div
                    className="flex flex-col fixed bg-gray-200"
                    style={{
                        top: headerHeight,
                        height: `calc(100vh - ${headerHeight})`,
                        width: sidebarWidth,
                    }}
                >
                    <CasesList
                        patientId={patient.data.id}
                        onEpisodeSelected={onEpisodeSelected}
                        selectedEpisodeId={selectedEpisodeId}
                        style={{ height: `calc(100vh - ${headerHeight})` }}
                    />
                </div>
                <EpisodeDetail
                    episodeId={selectedEpisodeId}
                    className="fixed overflow-y-auto overflow-x-hidden"
                    style={{
                        left: sidebarWidth,
                        top: headerHeight,
                        width: `calc(100vw - ${sidebarWidth})`,
                        height: `calc(100vh - ${headerHeight})`,
                    }}
                />
            </div>
        </div>
    );
}
