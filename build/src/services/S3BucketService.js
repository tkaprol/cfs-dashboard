import apiRequest from "../api/instance";

export const getAllS3Bucket = async (token) =>{
    
    const config = {
        method: 'GET',
        url: '/S3/buckets',
        headers: {
            "Authorization": 'Bearer '+ token
        },     
    };

    return await apiRequest(config);
}

export const getBucketFiles = async (token,bucketName) =>{
    const config = {
        method: 'GET',
        url: '/S3/bucket/' + bucketName + '/files',
        headers: {
            "Authorization": 'Bearer '+ token
        },
    };

    return await apiRequest(config);
}

export const getFileContentFromBucket = async (token,bucketName, key) =>{
    const config = {
        method: 'GET',
        url: '/S3/bucket/' + bucketName + '/files/preview',
        headers: {
            "key": key,
            "Authorization": 'Bearer '+ token
        
        }
    };

    return await apiRequest(config);
}

export const parseFileDefinition = async (token,data) => {

    const config = {
        method: 'POST',
        url: '/S3/files/js/def',
        data: data,
        headers: {
            "Authorization": 'Bearer '+ token
        },
    };

    return await apiRequest(config);
}
