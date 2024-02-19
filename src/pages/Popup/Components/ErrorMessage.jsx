import React from 'react';

import '../../../styles.css';

class ErrorMessage extends React.Component {
    render() {
        return (
            <div className='w-full h-full flex items-center justify-center'>
                <div>
                    <div className='text-lg text-center w-80'>{this.props.title}</div>
                    <div className='text-center w-80'>{this.props.message}</div>
                    {
                        this.props.children ?
                            (<div className='text-center w-80'>{this.props.children}</div>) :
                            ""
                    }

                </div>
            </div>
        )
    }
}

export default ErrorMessage;
