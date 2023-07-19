const BASE_URL = window.__RUNTIME_CONFIG__.REACT_APP_API_ROOT_URI;
export const getOpenSearchHealth = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/OpenSearch/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return;
  }
};

export const getOpenSearchIndices = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/OpenSearch/indices`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return;
  }
};

export const getOpenSearchIndiceMapping = async (token, index) => {
  try {
    const response = await fetch(`${BASE_URL}/OpenSearch/indices/${index}/mapping`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return;
  }
};

export const getOpenSearchIndiceSearch = async (token, index, query) => {
  try {
    const response = await fetch(`${BASE_URL}/OpenSearch/indices/${index}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
      body: JSON.stringify(query),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return;
  }
};
