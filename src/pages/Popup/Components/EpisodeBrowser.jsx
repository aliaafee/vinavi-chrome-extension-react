import React from 'react';

import '../../../styles.css';

import VinaviApi from '../../../api/VinaviApi'
import CasesList from './CasesList';
import EpisodeDetail from './EpisodeDetail';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';


class EpisodeBrowser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            patient: null,
            selectedEpisodeId: null,
        };
    }

    static getDerivedStateFromProps(props, state) {
        if (state.patient !== null) {
            if (state.patient.data.id === props.patient.data.id) {
                return null
            }
        }

        return {
            patient: props.patient,
            selectedEpisodeId: null
        }
    }

    onEpisodeSelected = (episode) => {
        this.setState({
            selectedEpisodeId: episode.id
        })
    }

    getAge(dateOfBirth) {
        const diff_ms = Date.now() - dateOfBirth;
        const years = diff_ms / 1000 / 3600 / 24 / 365;
        const months = years % 1 * 12;
        if (years < 1) {
            return `${Math.floor(months)} months`;
        }
        return `${Math.floor(years)} years ${Math.floor(months)} months`;
    }

    render() {
        const headerHeight = "86px";
        const sidebarWidth = "200px";

        return (
            <div className='flex flex-col'>
                <div className='fixed bg-gray-200 grid grid-cols-2 w-screen gap-1.5 p-1.5'>
                    <div className='col-span-2 text-lg'>
                        {this.state.patient.data.attributes.patient_name}
                    </div>
                    <div>
                        {this.getAge(new Date(this.state.patient.data.attributes.birth_date))}
                    </div>
                    <div className='capitalize'>
                        {this.state.patient.data.attributes.gender}
                    </div>
                    <div>
                        {this.state.patient.data.attributes.national_identification}
                    </div>
                    <div>
                        Birth Date {this.state.patient.data.attributes.birth_date}
                    </div>
                </div>
                <div className=''>
                    <div className='flex flex-col fixed bg-gray-200' style={{ top: headerHeight, height: `calc(100vh - ${headerHeight})`, width: sidebarWidth }}>
                        <CasesList
                            patientId={this.state.patient.data.id}
                            onEpisodeSelected={this.onEpisodeSelected}
                            selectedEpisodeId={this.state.selectedEpisodeId}
                            style={{height: `calc(100vh - ${headerHeight})`}}
                        />
                    </div>
                    <EpisodeDetail
                        episodeId={this.state.selectedEpisodeId}
                        className='fixed overflow-y-auto overflow-x-hidden'
                        style={{ left: sidebarWidth, top: headerHeight, width: `calc(100vw - ${sidebarWidth})`, height: `calc(100vh - ${headerHeight})` }}
                    />
                </div>
            </div >
        );
    }
}

export default EpisodeBrowser;
