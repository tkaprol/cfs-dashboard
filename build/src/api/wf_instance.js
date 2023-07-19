import axios from "axios";

const instance = axios.create({
    baseURL: window.__RUNTIME_CONFIG__.REACT_APP_DSL_API_ROOT_URI,
    headers: {
        "Content-Type": "application/json"
    }
})

const wf_apiRequest = async(config) => {
    try {
      const response = await instance(config);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

export default wf_apiRequest;