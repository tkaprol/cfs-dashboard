import apiRequest from "../api/instance";

export const getUsers = async (token) =>{
    
    const config = {
        method: 'GET',
        url: '/Users',
        headers: {
            "Authorization": 'Bearer '+ token
        }
    };

    return await apiRequest(config);
}

export const getUserInfo = async (token) =>{
    const config = {
        method: 'GET',
        url: '/Auth/UserInfo',
        headers: {
            "Authorization": 'Bearer '+ token
        }
    };

    return await apiRequest(config);
}

export const getUserDetailsPerId = async (token, userId) =>{
    const config = {
        method: 'GET',
        url: '/Users/'+ userId,
        headers: {
            "Authorization": 'Bearer '+ token
        }
    };

    return await apiRequest(config);
}

export const getUserHistory = async (token, userId) =>{
    const config = {
        method: 'GET',
        url: '/Users/'+ userId + '/history',
        headers: {
            "Authorization": 'Bearer '+ token
        }
    };

    return await apiRequest(config);
}