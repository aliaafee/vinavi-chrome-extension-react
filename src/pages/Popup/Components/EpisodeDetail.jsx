import React from 'react';

import './EpisodeDetail.css';
import NoteList from './NoteList';
import DiagnosisList from './DiagnosisList';
import PrescriptionList from './PrescriptionList';


class EpisodeDetailComponent extends React.Component {

    render() {
        console.log("selected episode", this.props.selectedEpisode);
        if (this.props.episode === null) {
            return (
                <div id="detail">
                    <div id="logo"></div>
                </div>
            )
        }

        const episode = this.props.episode;

        const episodeId = episode.data.id;
        const patientId = episode.data.relationships.patient.data.id;

        const doctor = episode.data.relationships.doctor.data.attributes;

        return (
            <div id="detail">
                <div>
                    <h2>
                        <span>Episode</span>
                        <a
                            title="Open episode"
                            target="_blank"
                            href={`https://vinavi.aasandha.mv/#/patients/${patientId}/episodes/${episodeId}`}>
                        </a>
                    </h2>
                    <ul className='episode-info'>
                        <li>
                            <span>created at</span>
                            <span>{episode.data.attributes.created_at}</span>
                        </li>
                        <li>
                            <span>visited on</span>
                            <span>{episode.data.attributes.visited_on}</span>
                        </li>
                        <li>
                            <span>doctor</span>
                            <span>{doctor.fullname}</span>
                        </li>
                    </ul>
                    <DiagnosisList
                        diagnoses={episode.data.relationships.diagnoses.data} />
                    <NoteList
                        notes={episode.data.relationships.notes.data} />
                    <PrescriptionList
                        prescriptions={episode.data.relationships.prescriptions.data} />
                </div>
            </div>
        )
    }
}

export default EpisodeDetailComponent;