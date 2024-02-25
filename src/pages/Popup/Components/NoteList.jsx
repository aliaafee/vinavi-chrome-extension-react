import React from 'react';


export default function NoteList({ notes }) {
    if (notes.length < 1) {
        return (<div id="notes"></div>)
    }
    return (
        <div id="notes">
            <h2 className='my-2 font-bold'>Notes</h2>
            <ul className='flex flex-col gap-2'>
                {notes.map(((note, index) => (
                    <li key={index} className={`rounded-md divide-solid divide-y divide-x-0 bg-gray-100 divide-grey-300 ${note.attributes.note_type}`}>
                        <div className='p-1.5 capitalize'>{note.attributes.note_type}</div>
                        <div className='p-1.5 whitespace-pre-wrap'>{note.attributes.notes}</div>
                    </li>
                )))}
            </ul>
        </div>
    )
}