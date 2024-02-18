import React from 'react';

import '../../../styles.css';
import NoteList from './NoteList';
import DiagnosisList from './DiagnosisList';
import PrescriptionList from './PrescriptionList';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';


class EpisodeInformation extends React.Component {
    render() {
        return (
            <ul className='grid bg-gray-200 p-1.5 gap-1.5 grid-cols-2 rounded-md'>
                <li className='flex flex-col'>
                    <span className='capitalize'>created at</span>
                    <span className='pl-1.5'>{this.props.episode.data.attributes.created_at}</span>
                </li>
                <li className='flex flex-col'>
                    <span className='capitalize'>visited on</span>
                    <span className='pl-1.5'>{this.props.episode.data.attributes.visited_on}</span>
                </li>
                <li className='flex flex-col'>
                    <span className='capitalize'>doctor</span>
                    <span className='font-bold pl-1.5'>Dr. {this.props.episode.data.relationships.doctor.data.attributes.fullname}</span>
                </li>
            </ul>
        )
    }
}


class EpisodeDetailComponent extends React.Component {

    render() {
        if (this.props.episode === null) {
            return (
                <div id="detail" className={this.props.className} style={this.props.style}>
                    <div className="logo w-full h-full opacity-10"></div>
                </div>
            )
        }

        if (this.props.episode === 'loading') {
            return (
                <div className={this.props.className} style={this.props.style}>
                    <LoadingSpinner />
                </div>
            )
        }

        if (this.props.episode === 'failed') {
            return (
                <div id="loading" className={this.props.className} style={this.props.style}>
                    <ErrorMessage 
                        title="Error"
                        message="Failed to load episode"
                    />
                </div>
            )
        }

        const episode = this.props.episode;

        const episodeId = episode.data.id;
        const patientId = episode.data.relationships.patient.data.id;

        return (
            <div className={this.props.className} style={this.props.style}>
                <div className='p-2'>
                    <h2 className='text-lg mb-2'>
                        <span>Episode</span>
                        <a
                            title="Open episode"
                            target="_blank"
                            href={`https://vinavi.aasandha.mv/#/patients/${patientId}/episodes/${episodeId}`}
                            className='ml-2 external-link bg-blue-400 hover:bg-blue-800'>

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
    }
}

export default EpisodeDetailComponent;