import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Provider } from "react-redux";
import store from "./store";
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
<Provider store={store}>
<App />
</Provider>,);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//"start": "cross-env NODE_ENV=development runtime-env-cra --config-name=./public/runtime-env.js && react-scripts start",
//"start": "set HTTPS=true&&set SSL_CRT_FILE=./nginx/cert.pem&&set SSL_KEY_FILE=./nginx/key.pem&&react-scripts start"
// mkcert -key-file /key.pem -cert-file /cert.pem "localhost"
reportWebVitals();
