import React from 'react';

import '../../../styles.css';

import VinaviApi from '../../../api/VinaviApi'
import EpisodeBrowser from './EpisodeBrowser';
import LoadingSpinner from './LoadingSpinner';


class PatientSearch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            patient: null,
            searchText: ''
        }
    }

    async componentDidMount() {
        this.setState({
            patient: 'loading'
        })

        const patientId = await VinaviApi.getCurrentPatientId();

        if (patientId === null) {
            this.setState({
                patient: null
            })
            return;
        }

        const patient = await VinaviApi.getPatient(patientId);

        if (patient === null) {
            this.setState({
                patient: 'failed'
            })
            return;
        }

        this.setState({
            patient: patient
        })
    }

    onSearchChanged = (event) => {
        this.setState({
            searchText: event.target.value
        })
    }

    onSearch = async (event) => {
        this.setState({
            patient: 'searching'
        })

        const patientSearchResult = await VinaviApi.searchPatientByNationalIdentification(this.state.searchText);

        if (patientSearchResult === null) {
            this.setState({
                patient: 'notfound'
            })
            return
        }

        if (!('data' in patientSearchResult)) {
            this.setState({
                patient: 'notfound'
            })
            return
        }

        if (!('id' in patientSearchResult['data'])) {
            this.setState({
                patient: 'notfound'
            })
            return
        }

        const patient = await VinaviApi.getPatient(patientSearchResult.data.id)

        if (patient === null) {
            this.setState({
                patient: 'notfound'
            })
            return
        }

        this.setState({
            patient: patient
        })
        return
    }

    render() {
        if (this.state.patient === null || this.state.patient === 'notfound' || this.state.patient === 'searching') {
            return (
                <div className='w-full h-full flex flex-col items-center justify-center'>
                    <div className='logo w-48 h-48'>

                    </div>
                    <div className='drop-shadow-md flex p-2 gap-2 bg-gray-300 rounded-md'>
                        <input
                            placeholder="Patient Identification"
                            value={this.state.searchText}
                            onChange={this.onSearchChanged}
                            className='p-1.5 rounded-md border-0 focus:outline-2 focus:outline-red-300'
                        />
                        <button
                            onClick={this.state.patient !== 'searching' ? this.onSearch : null}
                            className='w-12 p-1.5 rounded-md bg-gray-400 border-0 focus:outline-2 focus:outline-red-300 hover:bg-red-300'>
                            {
                                this.state.patient === 'searching' ? (<LoadingSpinner size='small' />) :
                                    'Go'
                            }
                        </button>
                    </div>
                    <div className='p-1.5'>
                        {
                            this.state.patient === 'searching' ? 'Searching' :
                                this.state.patient === 'notfound' ? 'Patient Not Found' :
                                    (<br />)
                        }
                    </div>
                </div>
            )
        }

        if (this.state.patient === 'loading') {
            return (
                <LoadingSpinner
                    message="Loading Patient."
                />
            )
        }

        if (this.state.patient === 'failed') {
            return (
                <ErrorMessage
                    title="Error"
                    message="Failed To Load Patient." />
            )
        }

        return (
            <EpisodeBrowser
                patient={this.state.patient} />
        )
    }
}

export default PatientSearch