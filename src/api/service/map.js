import axios from "axios";

export function getMapProjWKT(mapServiceUrl, mapName) {
    return axios({
        url: mapServiceUrl + "/maps/" + mapName + "/prjCoordSys.wkt",
        method: 'GET'
    });
}