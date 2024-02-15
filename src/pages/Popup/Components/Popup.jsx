import React from 'react';

import './Popup.css';
import VinaviApi from '../../../api/VinaviApi'
import CasesList from './CasesList';
import EpisodeDetail from './EpisodeDetail';


class Popup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            patient: null,
            cases: {},
            filteredCases: {},
            selectedEpisode: null,
            selectedEpisodeId: null,
            filterText: ''
        };
    }

    async componentDidMount() {
        const patient = await VinaviApi.getPatient();

        if (patient === null) {
            this.setState({
                patient: 'failed',
                cases: 'failed',
                filteredCases: 'failed'
            })
        }

        const cases = await VinaviApi.getAllCases(patient.data.id);

        console.log(cases);

        this.setState({
            patient: patient,
            cases: cases,
            filteredCases: cases
        })
    }

    async onEpisodeSelected(episode) {
        this.setState({
            selectedEpisode: 'loading',
            selectedEpisodeId: episode.id
        })

        const episodeDetail = await VinaviApi.getEpisodeDetail(episode.id);

        this.setState({
            selectedEpisode: episodeDetail
        })
    }

    onFilterChanged(event) {
        const filterText = event.target.value;
        this.setState({
            filterText: filterText,
            filteredCases: this.filterCases(filterText, this.state.cases)
        })
    }

    filterCases(filterText, cases) {
        if (filterText === "") {
            return cases
        }
        const filteredData = cases.data.filter((patientCase) => {
            return patientCase.relationships.episodes.data.reduce((accumulator, episode) => {
                const name = patientCase.relationships.doctor.data.attributes.fullname;
                return accumulator
                    || episode.relationships.doctor.data.attributes.fullname.toUpperCase().includes(filterText.toUpperCase())
                    || episode.attributes.created_at.includes(filterText)
            }, false)
        });
    
        return {
            data: filteredData,
            meta: {
                current_page: 1,
                last_page: 1
            }
        }
    
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
        if (this.state.patient === null) {
            return (
                <div id="loading">
                    <span class="spinner"><span></span></span>
                </div>
            )
        }

        if (this.state.patient === 'failed') {
            return (
                <div id="message">
                    <div>
                        <h1>Error</h1>
                        <div>Failed to load, patient not found.</div>
                    </div>
                </div>
            )
        }

        return (
            <div id="content">
                <div id="patient-info">
                    <div id="patient-name">
                        {this.state.patient.data.attributes.patient_name}
                    </div>
                    <div id="patient-age">
                        {this.getAge(new Date(this.state.patient.data.attributes.birth_date))}
                    </div>
                    <div id="patient-sex">
                        {this.state.patient.data.attributes.gender}
                    </div>
                    <div id="patient-nid">
                        {this.state.patient.data.attributes.national_identification}
                    </div>
                    <div id="patient-dob">
                        {this.state.patient.data.attributes.birth_date}
                    </div>
                </div>
                <div id="list-container">
                    <div id="filter">
                        <input
                            id="filter-input"
                            placeholder="Filter"
                            value={this.state.filterText}
                            onChange={(event) => this.onFilterChanged(event)}
                        />
                    </div>
                    <CasesList
                        cases={this.state.filteredCases}
                        onEpisodeSelected={(episode) => this.onEpisodeSelected(episode)}
                        selectedEpisodeId={this.state.selectedEpisodeId}
                    />
                </div>
                <EpisodeDetail
                    episode={this.state.selectedEpisode}
                />
            </div >
        );
    }
}

export default Popup;
