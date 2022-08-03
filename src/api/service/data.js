import axios from "axios";

export function getDataset(dataServiceUrl, datasource, dataset) {
    return axios({
        url: dataServiceUrl + "/data/datasources/" + datasource + "/datasets/" + dataset + ".json",
        method: 'GET'
    });
}

export function getFeatureResults(dataServiceUrl, postData) {
    return axios({
        url: dataServiceUrl + "/data/featureResults.json",
        method: 'POST',
        data: postData
    });
}