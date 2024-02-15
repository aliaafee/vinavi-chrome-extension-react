import React from 'react';

import './CasesList.css';


class CasesListComponent extends React.Component {
    render() {
        if (this.props.cases === null) {
            return (
                <div>Not Found</div>
            )
        }
        if (this.props.cases === 'failed') {
            return (
                <div>Failed to load</div>
            )
        }
        if (!('data' in this.props.cases)) {
            return (
                <div>Loading..</div>
            )
        }
        return (
            <div id="list">
                <ul className='cases'>
                    {this.props.cases.data.map((caseItem, caseIndex) => (
                        <li key={caseIndex}>
                            <div>
                                <span>case</span>
                                <span>{caseItem.attributes.created_at}</span>
                                <span>{caseItem.relationships.doctor.data.attributes.fullname}</span>
                            </div>
                            <div>
                                <ul className='episodes'>
                                    {caseItem.relationships.episodes.data.map((episode, episodeIndex) => (
                                        <li
                                            key={episodeIndex}
                                            onClick={() => this.props.onEpisodeSelected(episode)}
                                            className={this.props.selectedEpisodeId === episode.id ? "selected" : ""}>
                                            <span>episode</span>
                                            <span>{episode.attributes.created_at}</span>
                                            <span>{episode.relationships.doctor.data.attributes.fullname}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }
}

export default CasesListComponent;