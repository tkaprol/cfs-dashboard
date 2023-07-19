// socketMiddleware.js
import io from 'socket.io-client';
import { RECEIVE_MESSAGE_KAFKA,RECEIVE_MESSAGE_INIT, RECEIVE_MESSAGE_ELK, RECEIVE_MESSAGE_CHART_CONFIG, REQUEST_ELK_DATA } from './actions';
import Papa from 'papaparse';

let socket = null;

const socketMiddleware = store => next => action => {
  console.log("this is the action type ---- ")
  console.log(action.type)
  switch (action.type) {
    
    case 'CONNECT_SOCKET':
      if (!socket) {
        socket = io(window.__RUNTIME_CONFIG__.REACT_APP_DSL_API_ROOT_URI);
        
          console.log('check if connect 1', socket.connected);

          socket.on('connect', function() {
            console.log('check if connect  2', socket.connected);
          });

        socket.on('workflow:kafka:message:cfs', (message) => {
          // Dispatch action to store the received messag
           console.log("Received 01:", message);
          store.dispatch({ type: RECEIVE_MESSAGE_KAFKA, payload: JSON.parse(message) });
        });

        socket.on('workflow:kafka:message:init', (message) => {
          // Dispatch action to store the received message
            console.log("Received 02", message);
          store.dispatch({ type: RECEIVE_MESSAGE_INIT, payload: JSON.parse(message) });

        });
      }
      break;
    case 'AUTHENTICATE':
      if (socket) {
        socket.emit('auth', action.payload);
        console.log(' socket auth', action.payload);
      }
      break;
    case 'JOIN_CHANNEL':
      if (socket) {
        socket.emit('workflow:channel:join', action.payload);
        console.log(' socket join channel workflow:channel:join ', action.payload);
      }
      break;
    case REQUEST_ELK_DATA:
      console.log(' socket REQUEST_ELK_DATA ', action.payload);
      if (socket) {
        socket.emit('axios:proxy', action.payload, (acknowledgment) => {
          const parsedData = {};
          const convertedData = acknowledgment['hits']['hits'].map(obj => {

            for (const key in obj._source) {

              parsedData[key] = parseFloat(obj._source[key]);
            }

            return parsedData;
          });
          const getRandomColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16);
          const keys = Object.keys(convertedData[0]);

          // Map keys to columns with random colors
          const columns = keys.map(key => ({
            col: key,
            color: getRandomColor(),
            visible: true
          }));

          // Chart configuration
          const chartConfig = {
            legend: true,
            isAnimated: true,
            hasTooltip: true,
            columns: columns,
            mainAxis: 'name',
          };

          store.dispatch({ type: RECEIVE_MESSAGE_ELK, payload: convertedData });
          store.dispatch({ type: RECEIVE_MESSAGE_CHART_CONFIG, payload: chartConfig });
        });
      }
      break;
    case 'LEAVE_CHANNEL':
      if (socket) {
        socket.emit('workflow:channel:leave', action.payload);
      }
      break;
    default:
      break;
  }

  return next(action);
};

export default socketMiddleware;
