import {React, Fragment} from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import {Routes, Route} from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './components/App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <Fragment>
        <Routes>
          <Route path="/" element={<App />} />
        </Routes>
    </Fragment>
  </Router>
);
