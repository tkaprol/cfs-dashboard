// actions/index.js
export const CONNECT_SOCKET = 'CONNECT_SOCKET';
export const AUTHENTICATE = 'AUTHENTICATE';
export const JOIN_CHANNEL = 'JOIN_CHANNEL';
export const LEAVE_CHANNEL = 'LEAVE_CHANNEL';
export const RECEIVE_MESSAGE_INIT = 'RECEIVE_MESSAGE_INIT';

export const RECEIVE_MESSAGE_KAFKA = 'RECEIVE_MESSAGE_KAFKA';
export const RECEIVE_MESSAGE_ELK = 'RECEIVE_MESSAGE_ELK';
export const REQUEST_ELK_DATA = 'REQUEST_ELK_DATA';
export const RECEIVE_MESSAGE_CHART_CONFIG = 'RECEIVE_MESSAGE_CHART_CONFIG';

export const connectSocket = () => ({
  type: CONNECT_SOCKET
});

export const authenticate = (isAuthenticated) => ({
  type: AUTHENTICATE,
  payload: isAuthenticated
});

export const joinChannel = (channelName) => ({
  type: JOIN_CHANNEL,
  payload: channelName
});
export const requestElkData = (axios) => ({
  type: REQUEST_ELK_DATA,
  payload: axios
});

export const leaveChannel = (channelName) => ({
  type: LEAVE_CHANNEL,
  payload: channelName
});

export const receiveMessage = (message) => ({
  type: RECEIVE_MESSAGE_KAFKA,
  payload: message
});
export const receiveMessageInit = (message) => ({
  type: RECEIVE_MESSAGE_INIT,
  payload: message
});
export const receiveELK = (message) => ({
  type: RECEIVE_MESSAGE_ELK,
  payload: message
});
export const receiveChartConfig = (message) => ({
  type: RECEIVE_MESSAGE_CHART_CONFIG,
  payload: message
});