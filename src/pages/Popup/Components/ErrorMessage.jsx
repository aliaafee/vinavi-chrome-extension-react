import React from 'react';

import '../../../styles.css';

class ErrorMessage extends React.Component {
    render() {
        return (
            <div className='w-full h-full flex items-center justify-center'>
                <div>
                    <div className='text-lg text-center'>{this.props.title}</div>
                    <div>{this.props.message}</div>
                </div>
            </div>
        )
    }
}

export default ErrorMessage;
