import React from 'react';

import './DiagnosisList.css'

class DiagnosisList extends React.Component {
    render() {
        if (this.props.diagnoses.length < 1) {
            return (<div id="notes"></div>)
        }
        return (
            <div id="diagnoses">
                <h2>Diagnoses</h2>
                <ul className='diagnosis-list'>
                    {this.props.diagnoses.map(((diagnosis, index) => (
                        <li key={index}>
                            <span>{diagnosis.attributes['icd-code'].code}</span>
                            <span>{diagnosis.attributes['icd-code'].title}</span>
                            <span>{(diagnosis.attributes.remarks === null) ? "" : diagnosis.attributes.remarks}</span>
                        </li>
                    )))}
                </ul>
            </div>
        )
    }
}

export default DiagnosisList;