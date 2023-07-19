import { ADD_WORKFLOW, GET_WORKFLOW, EMPTY_WORKFLOW, DELETE_WORKFLOW } from './actions';


import { combineReducers } from 'redux';

const initProduct = {
  currentWorkflow: ''
}

function Workflow(state = initProduct, action) {
  switch (action.type) {
    case GET_WORKFLOW:
      return {
        
        state,
      };   
    
    case ADD_WORKFLOW:
      return {
        ...state,
        currentWorkflow: action.payload,
      };
    case EMPTY_WORKFLOW:
      state.currentWorkflow = '';
      return {
        ...state
      }
    default:
      return state;
  }
}

export default Workflow;