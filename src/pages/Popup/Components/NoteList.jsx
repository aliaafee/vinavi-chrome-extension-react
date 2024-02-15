import React from 'react';

import './NoteList.css'

class NoteList extends React.Component {
    render() {
        if (this.props.notes.length < 1) {
            return (<div id="notes"></div>)
        }
        return (
            <div id="notes">
                <h2>Notes</h2>
                <ul className='notes-list'>
                    {this.props.notes.map(((note, index) => (
                        <li key={index} className={`note ${note.attributes.note_type}`}>
                            <span>{note.attributes.note_type}</span>
                            <span>{note.attributes.notes}</span>
                        </li>
                    )))}
                </ul>
            </div>
        )
    }
}

export default NoteList;