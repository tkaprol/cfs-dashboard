import wf_apiRequest from '../api/wf_instance';

export const getUserWorkflows = async (token) => {
  const config = {
    method: 'GET',
    url: '/my/workflows?status=PUBLISHED&withCfs=true',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };

  return await wf_apiRequest(config);
};

export const getAllWorkflowData = async (token) => {
  const config = {
    method: 'GET',
    url: `/my/workflows`,
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };

  return await wf_apiRequest(config);
};

export const getAllWorkflowMarketplaceComponents = async (token) => {
  const config = {
    method: 'GET',
    url: `/marketplace`,
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };

  return await wf_apiRequest(config);
};

export const deleteWorkflowMarketplaceComponent = async (componentId, token) => {
  const config = {
    method: 'DELETE',
    url: `/marketplace/${componentId}`,
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };

  return await wf_apiRequest(config);
};
