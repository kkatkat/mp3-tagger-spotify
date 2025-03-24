import axios from "axios";

export async function getImageBuffer(url: string) {
    const response = await axios.get(url, {
        responseType: 'arraybuffer'
    })

    return Buffer.from(response.data);
}