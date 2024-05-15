import React, { useEffect, useState } from "react";
// import { JSONTree } from "react-json-tree";
import { SquareArrowOutUpRight } from "lucide-react";

import { getEpisodeDetail } from "../api/VinaviApi";
import NoteList from "./note-list";
import DiagnosisList from "./diagnosis-list";
import PrescriptionList from "./prescription-list";
import LoadingSpinner from "./loading-spinner";
import ErrorMessage from "./error-message";
import ServicesList from "./services-list";

function EpisodeInformation({ episode }) {
    if (!episode) {
        return <div>No episode selected</div>;
    }
    return (
        <ul className="grid bg-gray-200 p-1.5 gap-1.5 grid-cols-2 rounded-md">
            <li className="flex flex-col">
                <span className="capitalize">created at</span>
                <span className="pl-1.5">
                    {episode.data.attributes.created_at}
                </span>
            </li>
            <li className="flex flex-col">
                <span className="capitalize">visited on</span>
                <span className="pl-1.5">
                    {episode.data.attributes.visited_on}
                </span>
            </li>
            <li className="flex flex-col">
                <span className="capitalize">doctor</span>
                <span className="font-bold pl-1.5">
                    Dr.{" "}
                    {episode.data.relationships.doctor.data.attributes.fullname}
                </span>
            </li>
            <li className="flex flex-col">
                <span className="capitalize">service provider</span>
                <span className="font-bold pl-1.5">
                    {
                        episode.data.relationships["service-provider"].data
                            .attributes.name
                    }
                </span>
            </li>
        </ul>
    );
}

export default function EpisodeDetailComponent({
    episodeId,
    className = "",
    style = {},
}) {
    const [episode, setEpisode] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setLoading] = useState(false);

    useEffect(() => {
        if (episodeId === null) {
            return;
        }

        (async () => {
            setError(null);
            try {
                setLoading(true);

                const loadedEpisode = await getEpisodeDetail(episodeId);
                setEpisode(loadedEpisode);
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        })();
    }, [episodeId]);

    if (isLoading) {
        return (
            <div className={`${className} flex`} style={style}>
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className={`${className} flex`} style={style}>
                <ErrorMessage title="Error" message={error.message} />
            </div>
        );
    }

    if (!episode) {
        return (
            <div className={`${className} flex`} style={style}>
                <div className="logo w-full h-full opacity-10"></div>
            </div>
        );
    }

    return (
        <div className={`${className} flex justify-center`} style={style}>
            <div className="p-2 w-full max-w-lg">
                <h2 className="text-lg mb-2 flex gap-4">
                    <span>Episode</span>
                    <a
                        className="p-1.5 rounded-full hover:bg-gray-300"
                        title="Open episode"
                        target="_blank"
                        href={`https://vinavi.aasandha.mv/#/patients/${episode.data.relationships.patient.data.id}/episodes/${episode.data.id}`}
                    >
                        <SquareArrowOutUpRight size={16} color="black" />
                    </a>
                </h2>
                <EpisodeInformation episode={episode} />
                <DiagnosisList
                    diagnoses={episode.data.relationships.diagnoses.data}
                />
                <NoteList notes={episode.data.relationships.notes.data} />
                <ServicesList
                    services={
                        episode.data.relationships["requested-services"].data
                    }
                />
                <PrescriptionList
                    prescriptions={
                        episode.data.relationships.prescriptions.data
                    }
                />
                {/* <div className="rounded-md bg-gray-100 p-1.5 mt-5">
                    <JSONTree data={episode} />
                </div> */}
            </div>
        </div>
    );
}
