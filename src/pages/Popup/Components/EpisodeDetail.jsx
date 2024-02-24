import React, { useEffect, useState } from 'react';

import '../../../styles.css';

import VinaviApi from '../../../api/VinaviApi'
import NoteList from './NoteList';
import DiagnosisList from './DiagnosisList';
import PrescriptionList from './PrescriptionList';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';


function EpisodeInformation({ episode }) {
    if (!episode) {
        return (
            <div>
                No episode selected
            </div>
        )
    }
    return (
        <ul className='grid bg-gray-200 p-1.5 gap-1.5 grid-cols-2 rounded-md'>
            <li className='flex flex-col'>
                <span className='capitalize'>created at</span>
                <span className='pl-1.5'>{episode.data.attributes.created_at}</span>
            </li>
            <li className='flex flex-col'>
                <span className='capitalize'>visited on</span>
                <span className='pl-1.5'>{episode.data.attributes.visited_on}</span>
            </li>
            <li className='flex flex-col'>
                <span className='capitalize'>doctor</span>
                <span className='font-bold pl-1.5'>Dr. {episode.data.relationships.doctor.data.attributes.fullname}</span>
            </li>
        </ul>
    )
}


export default function EpisodeDetailComponent({ episodeId, className, style }) {
    const [episode, setEpisode] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setLoading] = useState(false);

    useEffect(
        () => {
            if (episodeId === null) {
                return
            }

            (async () => {
                setError(null);
                try {
                    setLoading(true);

                    const loadedEpisode = await VinaviApi.getEpisodeDetail(episodeId);
                    setEpisode(loadedEpisode);
                } catch (error) {
                    setError(error)
                } finally {
                    setLoading(false)
                }
            })();
        },
        [episodeId],
    );

    if (isLoading) {
        return (
            <div className={className} style={style}>
                <LoadingSpinner />
            </div>
        )
    }

    if (error) {
        return (
            <div className={className} style={style}>
                <ErrorMessage
                    title="Error"
                    message={error.message}
                />
            </div>
        )
    }

    if (!episode) {
        return (
            <div className={className} style={style}>
                <div className="logo w-full h-full opacity-10"></div>
            </div>
        )
    }

    return (
        <div className={className} style={style}>
            <div className='p-2'>
                <h2 className='text-lg mb-2'>
                    <span>Episode</span>
                    <a
                        title="Open episode"
                        target="_blank"
                        href={
                            `https://vinavi.aasandha.mv/#/patients/${episode.data.relationships.patient.data.id}/episodes/${episode.data.id}`
                        }
                        className='ml-2 external-link bg-blue-600 hover:bg-blue-800'>

                    </a>
                </h2>
                <EpisodeInformation
                    episode={episode} />
                <DiagnosisList
                    diagnoses={episode.data.relationships.diagnoses.data} />
                <NoteList
                    notes={episode.data.relationships.notes.data} />
                <PrescriptionList
                    prescriptions={episode.data.relationships.prescriptions.data} />
            </div>
        </div>
    )

};

// export default EpisodeDetailComponent;