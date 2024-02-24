import React from 'react';

import '../../../styles.css';

import VinaviApi from '../../../api/VinaviApi'
import EpisodeBrowser from './EpisodeBrowser';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';


class PatientSearch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: null,
            patient: null,
            searchText: '',
            statusMessage: ''
        }
    }

    async componentDidMount() {
        this.setState({
            user: 'loading'
        })

        try {
            const user = await VinaviApi.getAuthenticatedUser();
            const serviceProvider = await VinaviApi.getServiceProvider();

            this.setState({
                user: user
            })
        } catch (error) {
            if (error.cause) {
                if (error.cause.status === 401) {
                    this.setState({
                        user: 'notauthorized',
                    })
                }
                return
            }
            this.setState({
                user: 'failed',
                statusMessage: error.message
            })
            return
        }

        this.setState({
            patient: 'loading'
        })

        try {
            const patientId = await VinaviApi.getCurrentPatientId();
            if (patientId === null) {
                this.setState({
                    patient: null
                })
                return;
            }

            const patient = await VinaviApi.getPatient(patientId);

            this.setState({
                patient: patient
            })
        } catch (error) {
            this.setState({
                patient: 'failed'
            })
            return;
        }
    }

    onSearchChanged = (event) => {
        this.setState({
            searchText: event.target.value
        })
    }

    onSearchKeyUp = (event) => {
        console.log(event.key);
        if (event.key === 'Enter') {
            this.onSearch();
        }
    }

    onSearch = async (event) => {
        this.setState({
            patient: 'searching'
        })

        try {
            const patientSearchResult = await VinaviApi.searchPatientByNationalIdentification(this.state.searchText);

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

            this.setState({
                patient: patient
            })
        } catch (error) {
            if (error.cause) {
                if (error.cause.status == 404) {
                    this.setState({
                        statusMessage: "Patient not found"
                    })
                }
            } else {
                this.setState({
                    statusMessage: error.message
                })
            }
            this.setState({
                patient: 'notfound'
            })
        }
    }

    render() {
        if (this.state.user === 'loading' || this.state.user === null) {
            return (
                <LoadingSpinner
                    message="Checking Login Status."
                />
            )
        }

        if (this.state.user === 'failed' || this.state.user === 'notauthorized') {
            return (
                <ErrorMessage
                    title="Error"
                    message="Not Authorized.">
                    Go to <a target='_blank' href='https://auth.aasandha.mv/auth/login' className='text-blue-600 hover:underline'>
                        https://auth.aasandha.mv/auth/login
                    </a> to complete login and select service provider.
                    {this.state.user === 'failed' && (
                        <div className='p-1.5 bg-red-100 rounded-md'>
                            {this.state.statusMessage}
                        </div>
                    )}
                </ErrorMessage>
            )
        }

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
                            onKeyUp={this.onSearchKeyUp}
                            className='p-1.5 rounded-md border-0 focus:outline-2 focus:outline-red-300'
                        />
                        <button
                            onClick={this.state.patient !== 'searching' ? this.onSearch : null}
                            className='w-12 p-1.5 rounded-md bg-red-300 border-0 focus:outline-2 focus:outline-red-300 hover:bg-red-400'>
                            {
                                this.state.patient === 'searching' ? (<LoadingSpinner size='small' />) :
                                    'Go'
                            }
                        </button>
                    </div>
                    <div className='p-1.5'>
                        {
                            this.state.patient === 'searching' ? 'Searching' :
                                this.state.patient === 'notfound' ? this.state.statusMessage :
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