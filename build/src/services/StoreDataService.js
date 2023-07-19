import apiRequest from "../api/instance";

export const getStoreDataByRange = async (token , range = 100) =>{
    
    const config = {
        method: 'GET',
        url: '/Store/all?range=' + range,
        headers: {
            "Authorization": 'Bearer '+ token
        }, 


    };

    return await apiRequest(config);
}

export const deleteStoreData = async (token) =>{
    const config = {
        method: 'DELETE',
        url: '/Store/clear',
        headers: {
            "Authorization": 'Bearer '+ token
        }, 
    };

    return await apiRequest(config);
}
