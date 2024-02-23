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
            cases: {},
            filteredCases: {},
            selectedEpisode: null,
            selectedEpisodeId: null,
            filterText: ''
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
            cases: null,
            filterCases: null,
            selectedEpisode: null,
            selectedEpisodeId: null,
            filterText: ''
        }
    }

    async componentDidMount() {
        // const patientId = this.props.patientId !== undefined
        //     ? this.props.patientId
        //     : await VinaviApi.getCurrentPatientId();

        // if (patientId === null) {
        //     this.setState({
        //         patient: 'failed',
        //         cases: 'failed',
        //         filteredCases: 'failed'
        //     });
        //     return
        // }

        // const patient = await VinaviApi.getPatient(patientId);

        // if (patient === null) {
        //     this.setState({
        //         patient: 'failed',
        //         cases: 'failed',
        //         filteredCases: 'failed'
        //     });
        //     return
        // }

        if (this.state.patient === null) {
            return;
        }

        if (this.state.cases !== null) {
            return;
        }

        const cases = await VinaviApi.getAllCases(this.state.patient.data.id);

        if (cases === null) {
            this.setState({
                patient: 'failed',
                cases: 'failed',
                filteredCases: 'failed'
            });
            return
        }

        this.setState({
            cases: cases,
            filteredCases: cases
        })
    }

    onEpisodeSelected = async (episode) => {
        this.setState({
            selectedEpisode: 'loading',
            selectedEpisodeId: episode.id
        })

        const episodeDetail = await VinaviApi.getEpisodeDetail(episode.id);

        if (episodeDetail === null) {
            this.setState({
                selectedEpisode: 'failed'
            })
            return
        }

        this.setState({
            selectedEpisode: episodeDetail
        })
    }

    onFilterChanged = (event) => {
        const filterText = event.target.value;
        this.setState({
            filterText: filterText,
            filteredCases: this.filterCases(filterText)
        })
    }

    filterCases(filterText) {
        if (filterText === "") {
            return this.state.cases
        }
        const filteredData = this.state.cases.data.filter((patientCase) => {
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
        if (this.state.cases === null) {
            return (
                <LoadingSpinner
                    message="Loading Episodes."
                />
            )
        }

        if (this.state.cases === 'failed') {
            return (
                <ErrorMessage
                    title="Error"
                    message="Failed To Load Episodes." />
            )
        }

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
                        <div className='px-1.5 pt-1.5 pb-0 font-bold bg-gray-300'>
                            Episodes
                        </div>
                        <div className='flex flex-col p-1.5 bg-gray-300'>
                            <input
                                placeholder="Filter"
                                value={this.state.filterText}
                                onChange={this.onFilterChanged}
                                className='p-1.5 rounded-md border-0 focus:outline-2 focus:outline-red-300'
                            />
                        </div>
                        <CasesList
                            cases={this.state.filteredCases}
                            onEpisodeSelected={this.onEpisodeSelected}
                            selectedEpisodeId={this.state.selectedEpisodeId}
                            className='overflow-y-auto overflow-x-hidden'
                        />
                    </div>
                    <EpisodeDetail
                        episode={this.state.selectedEpisode}
                        className='fixed overflow-y-auto overflow-x-hidden'
                        style={{ left: sidebarWidth, top: headerHeight, width: `calc(100vw - ${sidebarWidth})`, height: `calc(100vh - ${headerHeight})` }}
                    />
                </div>
            </div >
        );
    }
}

export default EpisodeBrowser;
