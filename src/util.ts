import axios from "axios";

export async function getImageBuffer(url: string) {
    const response = await axios.get(url, {
        responseType: 'arraybuffer'
    })

    return Buffer.from(response.data);
}

export function cleanQuery(query: string) {
    return query
        .replace(/[\[\]\(\)]/g, '')
        .replace(/(feat|ft)\.?\s/gi, '')
        .replace(/ original mix/gi, '')
        .replace(/ extended mix/gi, '')
        .replace(/ radio edit/gi, '')
        .trim();
}