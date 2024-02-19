import React from 'react';
import { createRoot } from 'react-dom/client';

import EpisodeBrowser from './Components/EpisodeBrowser';
import PatientSearch from './Components/PatientSearch';

const container = document.getElementById('app-container');
const root = createRoot(container);
root.render(<PatientSearch />);