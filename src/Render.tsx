import React from "react";
import ReactDOM from "react-dom/client";
import './Render.css';
import App from "./App";
import $ from 'jquery';

// If development environment
//https://www.geeksforgeeks.org/hot-reload-in-electronjs/
const env = process.env.NODE_ENV || 'development';
if (env === 'development') {
  try {
      require('electron-reloader')(module, {
          debug: true,
          watchRenderer: true
      });
  } catch (_) { console.log('Error'); }    
}

$(document).ready(function() {
  console.log("INITIALIZING REACT DOM");
  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  );
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
