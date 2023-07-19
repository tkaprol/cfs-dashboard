// Action Types
export const ADD_WORKFLOW = 'ADD_WORKFLOW';
export const GET_WORKFLOW = 'GET_WORKFLOW';
export const EMPTY_WORKFLOW = 'EMPTY_WORKFLOW';
export const DELETE_WORKFLOW = 'DELETE_WORKFLOW';

// Action Creators
export const addWorkflow = (item) => ({
  type: ADD_WORKFLOW,
  payload: item,
});

export const getWorkflow = () => ({
  type: GET_WORKFLOW,
});

export const emptyWorkflow = (item) => ({
  type: EMPTY_WORKFLOW,
  payload: item,
});

export const deleteWorkflow = (id) => ({
  type: DELETE_WORKFLOW,
  payload: id,
});
