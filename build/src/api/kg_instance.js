import axios from "axios";

const kg_instance = axios.create({
    baseURL: window.__RUNTIME_CONFIG__.REACT_APP_KG_API_ROOT_URI,
    timeout: 3600000,
    headers: {
        "Content-Type": "application/json"
    }
})

const kg_apiRequest = async(config) => {
    try {
      const response = await kg_instance(config);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

export default kg_apiRequest;