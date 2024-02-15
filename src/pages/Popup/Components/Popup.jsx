import React from 'react';

import './Popup.css';
import VinaviApi from '../../../api/VinaviApi'
import CasesList from './CasesList';
import EpisodeDetail from './EpisodeDetail';


class Popup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cases: {},
            selectedEpisode: null
        };
    }

    async componentDidMount() {
        const cases = await VinaviApi.getCases();
        console.log(cases)
        this.setState({
            cases: cases
        })
    }

    async onEpisodeSelected(episode) {
        const episodeDetail = await VinaviApi.getEpisodeDetail(episode.id);
        console.log(episodeDetail);
        this.setState({
            selectedEpisode: episodeDetail
        })
    }

    render() {
        return (
            <div id="content">
                <div id="patient-info">
                    <div id="patient-name">...</div>
                    <div id="patient-age">...</div>
                    <div id="patient-sex">...</div>
                    <div id="patient-nid">...</div>
                    <div id="patient-dob">...</div>
                </div>
                <div id="list-container">
                    <div id="filter">
                        <input id="filter-input" value="" placeholder="Filter" />
                    </div>
                    <CasesList
                        cases={this.state.cases}
                        onEpisodeSelected={(episode) => this.onEpisodeSelected(episode)}
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
