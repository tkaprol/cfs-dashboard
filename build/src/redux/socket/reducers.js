// reducers/socketReducer.js
import { combineReducers } from 'redux';
import { RECEIVE_MESSAGE_KAFKA, RECEIVE_MESSAGE_ELK , RECEIVE_MESSAGE_INIT,RECEIVE_MESSAGE_CHART_CONFIG} from './actions';

const initialState = {
  messagesKafka: [],
  messagesElk: [],
  messagesChartConfig:[],
  messagesInit:[]
};

const socketReducer = (state = initialState, action) => {
  switch (action.type) {
    case RECEIVE_MESSAGE_KAFKA:
      // Store the received message in the Redux store
      return {
        ...state,
        messagesKafka: [...state.messagesKafka, action.payload]
      };
      case RECEIVE_MESSAGE_ELK:
        // Store the received message in the Redux store
        return {
          ...state,
          messagesElk: [...state.messagesElk, action.payload]
        };
        case RECEIVE_MESSAGE_INIT:
          // Store the received message in the Redux store
          return {
            ...state,
            messagesInit: [...state.messagesInit, action.payload]
          };
        case RECEIVE_MESSAGE_CHART_CONFIG:
          // Store the received message in the Redux store
          return {
            ...state,
            messagesChartConfig: [...state.messagesChartConfig, action.payload]
          };
    default:
      return state;
  }
};

export default socketReducer;
