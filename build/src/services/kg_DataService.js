import kg_apiRequest from "../api/kg_instance";

export const startKG_Service =  async (token) =>{
    
    const config = {
        method: 'GET',
        url: '/api/start-service',
        headers: {
            "Authorization": 'Bearer '+ token
        },
    };

    return await kg_apiRequest(config);
}

export const getKG_ServiceStatus =  async (token) =>{
    
    const config = {
        method: 'GET',
        url: '/api/service-status',
        headers: {
            "Authorization": 'Bearer '+ token
        },
    };

    return await kg_apiRequest(config);
}

export const executeQuery =  async (token,query) =>{
    
    const config = {
        method: 'GET',
        url: '/api/execute-query?query='+query,
        headers: {
            "Authorization": 'Bearer '+ token
        },
    };

    return await kg_apiRequest(config);
}

export const executeQueryAdvanced =  async (token,query, sources) =>{
    
    const config = {
        method: 'GET',
        url: '/api/execute-advanced-query?query='+query+'&sources='+sources,
        headers: {
            "Authorization": 'Bearer '+ token
        },
    };

    return await kg_apiRequest(config);
}

export const searchBasicMetaDataSet =  async (token,values) =>{
    
    const config = {
        method: 'GET',
        url: '/api/search-basic-MetaDataSet?commaDelimitedValues='+values,
        headers: {
            "Authorization": 'Bearer '+ token
        },
    };

    return await kg_apiRequest(config);
}

export const searchDataSet =  async (token,values) =>{
    
    const config = {
        method: 'GET',
        url: '/api/search-DataSet?values='+values,
        headers: {
            "Authorization": 'Bearer '+ token
        },
    };

    return await kg_apiRequest(config);
}

export const searchDataSetV1 =  async (token,values, deprecatedFormat) =>{
    
    const config = {
        method: 'GET',
        url: '/api/search-DataSet/v1/Get/'+values+'/'+ deprecatedFormat,
        headers: {
            "Authorization": 'Bearer '+ token
        },
    };

    return await kg_apiRequest(config);
}

export const searchDataSetV2 =  async (token,values) =>{
    
    const config = {
        method: 'GET',
        url: '/api/search-DataSet/v2/Get/'+values,
        headers: {
            "Authorization": 'Bearer '+ token
        },
    };

    return await kg_apiRequest(config);
}

export const searchRelatedDataSetsPerId =  async (token,id) =>{
    
    const config = {
        method: 'GET',
        url: '/api/search-related-DataSets?id='+id,
        headers: {
            "Authorization": 'Bearer '+ token
        },
    };

    return await kg_apiRequest(config);
}

export const searchFullMetaData =  async (token,id) =>{
    
    const config = {
        method: 'GET',
        url: '/api/search-full-metadata?datasetID='+id,
        headers: {
            "Authorization": 'Bearer '+ token
        },
    };

    return await kg_apiRequest(config);
}

export const searchDataSetBreakdownPerId =  async (token,id) =>{
    
    const config = {
        method: 'GET',
        url: '/api/search-dataset-breakdown/'+id,
        headers: {
            "Authorization": 'Bearer '+ token
        },
    };

    return await kg_apiRequest(config);
}

export const searchDataSetBreakdownPerIdWithOptions =  async (token,id, options) =>{
    
    const config = {
        method: 'GET',
        url: '/api/search-dataset-breakdown-with-option/'+id+'?options='+ options,
        headers: {
            "Authorization": 'Bearer '+ token
        },
    };

    return await kg_apiRequest(config);
}

export const searchDataSetBreakdownPerIdWithOptionsAndPost =  async (token,id, data) =>{
    
    const config = {
        method: 'POST',
        url: '/api/search-dataset-breakdown/'+id,
        data: data,
        headers: {
            "Authorization": 'Bearer '+ token
        },
    };

    return await kg_apiRequest(config);
}

export const generateApiCall =  async (token,id, optionsJson, downlodOption) =>{
    
    const config = {
        method: 'GET',
        url: '/api/generate-api-call?id='+id+'&optionsJson='+optionsJson+'&downloadOption='+downlodOption,
        headers: {
            "Authorization": 'Bearer '+ token
        },
    };

    return await kg_apiRequest(config);
}

export const generateApiCallWithPost = async (token,id, data) =>{
    
    const config = {
        method: 'POST',
        url: '/api/generate-api-call?id='+id,
        data: data,
        headers: {
            "Authorization": 'Bearer '+ token
        },
    };

    return await kg_apiRequest(config);
}
