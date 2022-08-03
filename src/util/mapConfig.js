import Tile from 'ol/layer/Tile'
import {TileSuperMapRest} from "@supermap/iclient-ol";
import {View} from "ol";
import {config} from "@/global";
import {get} from "ol/proj";

let extent_m = [-20037508.3427892, -20037508.3427892, 20037508.3427892, 20037508.3427892];
let extent_degree = [-180, -90, 180, 90];

export function getMapConfig() {
    let mapConfig = config["mapConfig"];
    let mapService = config["mapService"];
    let projection = get(mapConfig.projection);
    let extent = projection.getUnits() === 'm' ? extent_m : extent_degree;
    let center = [];
    mapConfig.center.split(",").forEach(item => center.push(Number(item)));
    return {
        layers: [
            new Tile({
                source: new TileSuperMapRest({
                    url: mapService.url + '/maps/' + mapService.map,
                    wrapX: true,
                    extent: extent
                }),
                id: 'baseLayer',
            })
        ],
        view: new View({
            projection: mapConfig.projection,
            center: center,
            minZoom: 1,
            zoom: mapConfig.zoom,
            // extent: extent
        })
    };
}
