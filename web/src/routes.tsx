import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';

import Home from './pages/Home';
import CreatePoint from './pages/CreatePoint';

const Routes = () => (
  <BrowserRouter>
    <Route path="/" exact component={Home} />
    <Route path="/register" component={CreatePoint} />
  </BrowserRouter>
);

export default Routes;
