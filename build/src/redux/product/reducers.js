import { ADD_ITEM, GET_ITEMS, UPDATE_ITEM, DELETE_ITEM } from './actions';

const initialState = {
  items: JSON.parse(localStorage.getItem('items')) || [],
};

const ProductsList = (state = initialState, action) => {
  switch (action.type) {
    case ADD_ITEM:
      const newItems = [...state.items, action.payload];
      localStorage.setItem('items', JSON.stringify(newItems));
      console.log('ADD_ITEM', JSON.stringify(newItems));
      return {
        ...state,
        items: newItems,
      };
    case GET_ITEMS:
      console.log('GET_ITEMS', state.items);
      return state;
    case UPDATE_ITEM:
      const updatedItems = state.items.map((item) => (item.id === action.payload.id ? action.payload : item));
      localStorage.setItem('items', JSON.stringify(updatedItems));
      console.log('ADD_ITEM', JSON.stringify(updatedItems));
      return {
        ...state,
        items: updatedItems,
      };
    case DELETE_ITEM:
      const filteredItems = state.items.filter((item) => item.id !== action.payload.id);
      localStorage.setItem('items', JSON.stringify(filteredItems));
      return {
        ...state,
        items: filteredItems,
      };
    default:
      return state;
  }
};

export default ProductsList;
