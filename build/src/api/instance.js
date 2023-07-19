import axios from "axios";

const instance = axios.create({
    baseURL: window.__RUNTIME_CONFIG__.REACT_APP_API_ROOT_URI,
    headers: {
        "Content-Type": "application/json"
    }
})

const apiRequest = async(config) => {
    console.log(config)
    try {
      const response = await instance(config);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

export default apiRequest;