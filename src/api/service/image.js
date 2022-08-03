import axios from "axios";
import {config} from "../../global";

export function getCollections() {
    return axios({
        url: config.root + "/collections.json",
        method: 'GET'
    });
}

export function getTileInfo(collectionID) {
    return axios({
        url: config.root + "/collections/" + collectionID + "/tileInfo.json",
        method: 'GET'
    });
}

export function search(postData, params, method = "POST") {
    return axios({
        url: config.root + "/search.json",
        method: method,
        params: params,
        data: postData
    });
}

export function getItem(collectionID, itemID) {
    return axios({
        url: config.root + "/collections/" + collectionID + "/items/" + itemID + ".json",
        method: 'GET'
    });
}

export function getItems(collectionID, params) {
    return axios({
        url: config.root + "/collections/" + collectionID + "/items.json",
        method: 'GET',
        params: params
    });
}

