import React, { useState } from "react";

import CasesList from "./cases-list";
import EpisodeDetail from "./episode-detail";
import VerticalSplitter from "./vertical-splitter";

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
        <div className="flex flex-col grow overflow-auto">
            <div className="bg-gray-200 grid grid-cols-2 w-screen gap-1.5 p-1.5">
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
            <VerticalSplitter>
                <CasesList
                    patientId={patient.data.id}
                    onEpisodeSelected={onEpisodeSelected}
                    selectedEpisodeId={selectedEpisodeId}
                    className="grow"
                />
                <EpisodeDetail episodeId={selectedEpisodeId} className="grow" />
            </VerticalSplitter>
        </div>
    );
}
