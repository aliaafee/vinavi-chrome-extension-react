import React from 'react';

import '../../../styles.css';

class LoadingSpinner extends React.Component {
    render() {
        return (
            <div className='w-full h-full flex flex-col items-center justify-center'>
                <div className='p-2'>{this.props.message}</div>
                <div className='animate-spin w-8 h-8 rounded-full border-4 border-grey-200 border-t-black border-solid'></div>
            </div>
        )
    }
}

export default LoadingSpinner;
