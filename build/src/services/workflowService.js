import apiRequest from "../api/instance";

export const createWorkflow = async (token, data) =>{
    
    const config = {
        method: 'POST',
        url: '/Kafka/workflow',
        headers: {
            "Authorization": 'Bearer '+ token
        },
        data: data
    };

    return await apiRequest(config);
}