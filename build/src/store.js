import { createStore, applyMiddleware,combineReducers  } from 'redux';
import thunkMiddleware from 'redux-thunk';
import cartReducer from './redux/cart/reducers'
import productReducer from './redux/product/reducers'
import workflowReducer from './redux/workflow/reducers'
import socketReducer from './redux/socket/reducers'

import socketMiddleware from './redux/socket/socketMiddleware'

const rootReducer = combineReducers({
    products: productReducer,
    cart: cartReducer,
    workflow: workflowReducer,
    socketData: socketReducer
  });
  
  const store = createStore(rootReducer,applyMiddleware(socketMiddleware));

export default store;