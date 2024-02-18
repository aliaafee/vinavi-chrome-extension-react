import React from 'react';
import { createRoot } from 'react-dom/client';

import Popup from './Components/Popup';

const container = document.getElementById('app-container');
const root = createRoot(container);
root.render(<Popup />);