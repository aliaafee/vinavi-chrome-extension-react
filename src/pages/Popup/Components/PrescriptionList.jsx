import React from 'react';

import './PrescriptionList.css'

class PrescriptionList extends React.Component {
    render() {
        if (this.props.prescriptions.length < 1) {
            return (<div id="prescriptions"></div>)
        }
        return (
            <div id="prescriptions">
                <h2>Prescription</h2>
                <ul className='prescriptions-list'>
                    {this.props.prescriptions.map(((prescription, index) => (
                        <li key={index}>
                            <div>
                                <span>created at </span>
                                <span>{prescription.attributes.created_at}</span>
                            </div>
                            <ol>
                                {prescription.relationships.medicines.data.map((prescription_medicine, medicineIndex) => {
                                    if (prescription_medicine.relationships['preferred-medicine'] === null) {
                                        return (
                                            <li key={medicineIndex}>
                                                <span class="medicine-name">${prescription_medicine.attributes.name} </span>
                                                <span>${prescription_medicine.attributes.instructions}</span>
                                            </li>
                                        )
                                    }
                                    const preferred_medicine = prescription_medicine.relationships['preferred-medicine'].data;
                                    return (
                                        <li key={medicineIndex}>
                                            <span>{preferred_medicine.attributes.preparation} </span>
                                            <span class="medicine-name">{preferred_medicine.attributes.name} </span>
                                            <span>{preferred_medicine.attributes.strength} </span>
                                            <span>{prescription_medicine.attributes.instructions} </span>
                                        </li>
                                    )

                                })}
                            </ol>
                        </li>
                    )))}
                </ul>
            </div>
        )
    }
}

export default PrescriptionList;