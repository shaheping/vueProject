import axios from "axios";
import proj4 from "proj4";
import {register} from "ol/proj/proj4";
import {getMapProjWKT} from "./api/service/map";

const URL = require('url');

export let config;

/**
 * 检查配置文件中的url，如果是localhost，把localhost转换为当前页面的host，否则访问不到服务
 * @param {string} url
 */
function checkUrl(url) {
    const localhost = "localhost";
    let parsedURL = URL.parse(url);
    if (parsedURL.hostname === localhost) {
        parsedURL.hostname = window.location.hostname;
        parsedURL.host = undefined;
        url = URL.format(parsedURL);
    }
    return url;
}

export async function init() {
    //先拿默认配置，再合并用户的设置，避免新增配置项找不到的情况
    let defaultConfig = (await axios.get('config.json')).data;
    let res = window.localStorage.getItem("SuperMap-MultiPhasePlay-Config");
    let userConfig = typeof (res) === "string" ? JSON.parse(res) : undefined;
    userConfig && delete userConfig.root;
    config = Object.assign(defaultConfig, userConfig);

    let mapServicesConfig = config["mapService"];
    if (mapServicesConfig && mapServicesConfig["url"]) {
        mapServicesConfig["url"] = checkUrl(mapServicesConfig["url"]);
    }

    try {
        //地图服务
        let wktStr = (await getMapProjWKT(mapServicesConfig["url"], mapServicesConfig["map"])).data;
        if (addProjectionFromWKT(wktStr)) {
            config.mapConfig.projection = getEpsgInfoFromWKT(wktStr);
        } else {
            throw new Error();
        }

    } catch {
        if (!config.mapConfig.projection) {
            config.mapConfig.projection = "EPSG:4326";
        }
        // alert("请检查地图服务配置");
    }

    // function getDatasetEPSGCode(dataset) {
    //     return "EPSG:" + dataset.datasetInfo.prjCoordSys.epsgCode;
    // }

    /**
     * 通过wkt参数扩展支持多坐标系
     *
     * @param {String} wkt 字符串
     *
     * @returns {Boolean} 坐标系是否添加成功
     */
    function addProjectionFromWKT(wkt) {
        if (typeof (wkt) !== 'string') {
            //参数类型错误
            return false;
        } else {
            let epsgCode = getEpsgInfoFromWKT(wkt);
            if (epsgCode) {
                if (epsgCode === "EPSG:4326" || epsgCode === "EPSG:3857") {
                    return true;
                } else {
                    proj4.defs(epsgCode, wkt);
                    register(proj4);
                }
                return true;
            } else {
                // 参数类型非wkt标准
                return false;
            }

        }
    }


    /**
     * 通过wkt参数获取坐标信息 copy from ol.supermap.WebMap.getEpsgInfoFromWKT
     * copy from iClient
     * @see ol.supermap.WebMap.getEpsgInfoFromWKT
     *
     * @param {String} wkt 字符串
     * @returns {String} epsg 如："EPSG:4326"
     */
    function getEpsgInfoFromWKT(wkt) {
        if (typeof (wkt) !== 'string') {
            return false;
        } else if (wkt.indexOf("EPSG") === 0) {
            return wkt;
        } else {
            let lastAuthority = wkt.lastIndexOf("AUTHORITY") + 10,
                endString = wkt.indexOf("]", lastAuthority) - 1;
            if (lastAuthority > 0 && endString > 0) {
                return `EPSG:${wkt.substring(lastAuthority, endString).split(",")[1].substr(1)}`;
            } else {
                return false;
            }
        }
    }
}