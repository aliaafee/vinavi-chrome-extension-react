import React from 'react';

import '../../../styles.css';


class CasesListComponent extends React.Component {
    render() {
        if (this.props.cases === null) {
            return (
                <div className={this.props.className}>Not Found</div>
            )
        }
        if (this.props.cases === 'failed') {
            return (
                <div className={this.props.className}>Failed to load</div>
            )
        }
        if (!('data' in this.props.cases)) {
            return (
                <div className={this.props.className}>Loading..</div>
            )
        }

        const liClassName = (episodeId) => ([
            "flex flex-col rounded-md cursor-pointer divide-solid divide-y divide-x-0",
            this.props.selectedEpisodeId === episodeId
                ? "bg-red-300 divide-black"
                : "bg-gray-100 hover:bg-red-100 divide-gray-300"
        ].join(" "));

        return (
            <div className={this.props.className}>
                <ul className='list-none m-0 p-1.5 flex flex-col gap-1.5'>
                    {this.props.cases.data.map((caseItem, caseIndex) => (
                        caseItem.relationships.episodes.data.map((episode, episodeIndex) => (
                            <li
                                key={episodeIndex}
                                onClick={() => this.props.onEpisodeSelected(episode)}
                                className={liClassName(episode.id)}>

                                <div className='rounded-t-md p-1.5'>
                                    {episode.attributes.created_at}
                                </div>
                                <div className='rounded-b-md font-bold p-1.5'>
                                    Dr. {episode.relationships.doctor.data.attributes.fullname}
                                </div>

                            </li>
                        ))
                    ))}
                </ul>
            </div >
        );
    }
}

export default CasesListComponent;