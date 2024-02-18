import React from 'react';
import { createRoot } from 'react-dom/client';

import EpisodeBrowser from './Components/EpisodeBrowser';

const container = document.getElementById('app-container');
const root = createRoot(container);
root.render(<EpisodeBrowser />);