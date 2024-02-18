import React from 'react';

// import './PrescriptionList.css'

class PrescriptionList extends React.Component {
    render() {
        if (this.props.prescriptions.length < 1) {
            return (<div id="prescriptions"></div>)
        }
        return (
            <div id="prescriptions">
                <h2 className='my-2 font-bold'>Prescription</h2>
                <ul className='flex flex-col gap-2'>
                    {this.props.prescriptions.map(((prescription, index) => (
                        <li key={index} className='rounded-md divide-solid divide-y divide-x-0 bg-gray-100 divide-grey-300'>
                            <div className='p-1.5'>
                                <span className='capitalize'>created at </span>
                                <span>{prescription.attributes.created_at}</span>
                            </div>
                            <ol className='flex flex-col gap-1.5 p-1.5 pl-5 list-decimal'>
                                {prescription.relationships.medicines.data.map((prescription_medicine, medicineIndex) => {
                                    if (prescription_medicine.relationships['preferred-medicine'] === null) {
                                        return (
                                            <li key={medicineIndex}>
                                                <span class="font-bold">${prescription_medicine.attributes.name} </span>
                                                <span>{prescription_medicine.attributes.instructions}</span>
                                            </li>
                                        )
                                    }
                                    const preferred_medicine = prescription_medicine.relationships['preferred-medicine'].data;
                                    return (
                                        <li key={medicineIndex}>
                                            <span>{preferred_medicine.attributes.preparation} </span>
                                            <span class="font-bold">{preferred_medicine.attributes.name} </span>
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