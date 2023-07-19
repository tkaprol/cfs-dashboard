import {
  GET_ALL_PRODUCT,
  GET_NUMBER_CART,
  EMPTY_CART,
  ADD_CART,
  DECREASE_QUANTITY,
  INCREASE_QUANTITY,
  DELETE_CART,
} from './actions';

const initProduct = {
  numberCart: 0,
  Carts: [],
  products: [],
};

function ShopApp(state = initProduct, action) {
  console.log(action.type);
  switch (action.type) {
    case GET_ALL_PRODUCT:
      return {
        ...state,
        products: action.payload,
      };
    case GET_NUMBER_CART:
      return {
        ...state,
      };
    case ADD_CART:
      if (state.numberCart == 0) {
        let cart = {
          id: action.payload.id,
          title: action.payload.title,
          quantity: 1,
          metaJSON: action.payload.metaJSON,
          pythonScript: action.payload.pythonScript,
          geometry: action.payload.geometry,
        };
        state.Carts.push(cart);
      } else {
        let check = false;
        state.Carts.map((item, key) => {
          if (item.id == action.payload.id) {
            state.Carts[key].quantity++;
            check = true;
          }
        });
        if (!check) {
          let _cart = {
            id: action.payload.id,
            title: action.payload.title,
            geometry: action.payload.geometry,
            quantity: 1,
            metaJSON: action.payload.metaJSON,
            pythonScript: action.payload.pythonScript,
          };
          state.Carts.push(_cart);
        }
      }
      return {
        ...state,
        numberCart: state.numberCart + 1,
      };
    case EMPTY_CART:
      state.numberCart = 0;
      state.Carts = [];
      return {
        ...state,
      };
    case INCREASE_QUANTITY:
      state.numberCart++;
      state.Carts[action.payload].quantity++;

      return {
        ...state,
      };
    case DECREASE_QUANTITY:
      let quantity = state.Carts[action.payload].quantity;
      if (quantity > 1) {
        state.numberCart--;
        state.Carts[action.payload].quantity--;
      }

      return {
        ...state,
      };

    case DELETE_CART:
      const cartItem = state.Carts.find((item) => item.id === action.payload); // Find the cart item by ID
      if (!cartItem) {
        return state; // If the item is not found, return the state unchanged
      }
      return {
        ...state,
        numberCart: state.numberCart - cartItem.quantity, // Subtract the quantity
        Carts: state.Carts.filter((item) => item.id !== action.payload), // Remove the item by ID
      };

    default:
      return state;
  }
}

export default ShopApp;
