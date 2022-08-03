import axios from "axios";

export async function getPrjParameterByEpsg(code) {
    code = "<" + code.split(":")[1] + ">";
    let epsg;
    let axiosResponse = (await axios.get('proj4/epsg')).data;
    axiosResponse.split("\n").map((line) => {
        if (line.startsWith(code)) {
            epsg = line.substring(line.indexOf(">") + 1, line.lastIndexOf("<")).trim();
        }
    })
    return epsg;
}