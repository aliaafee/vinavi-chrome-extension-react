import React from 'react';

import '../../../styles.css';

class LoadingSpinner extends React.Component {
    render() {
        if (this.props.size === 'small') {
            return (
                <div className='w-full h-full flex flex-col items-center justify-center'>
                    <div className='animate-spin w-4 h-4 rounded-full border-2 border-grey-200 border-t-black border-solid'></div>
                </div>
            )
        }
        return (
            <div className='w-full h-full flex flex-col items-center justify-center'>
                <div className='text-center p-2 w-80'>{this.props.message}</div>
                <div className='animate-spin w-8 h-8 rounded-full border-4 border-grey-200 border-t-black border-solid'></div>
            </div>
        )
    }
}

export default LoadingSpinner;
