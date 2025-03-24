// import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import settings from "./settings.js";
import path from "path";
import fs from 'fs';
import { Mp3File, SongTags } from "../types.js";
import { getImageBuffer } from "./util.js";
import NodeID3 from "node-id3";

const api = SpotifyApi.withClientCredentials(
    settings.client_id,
    settings.client_secret
);

const resolvedPath = path.resolve(settings.dir);

const fileNames = fs.readdirSync(resolvedPath);

const mp3Files: Mp3File[] = fileNames.map((fileName) => {
    const fileNameNoExtension = fileName.slice(0, -4);
    const [artist, title] = fileNameNoExtension.split(' - ');

    return {
        fileNameNoExtension,
        fileSongTitle: title,
        fileSongArtist: artist,
        path: path.join(resolvedPath, fileName)
    }
})

for (const song of mp3Files) {
    let response;
    try {
        const query = `${song.fileSongTitle} ${song.fileSongArtist}`;
        response = await api.search(query, ["track"], undefined, 1, 0);
    } catch (error) {
        console.log(song.fileNameNoExtension);
        console.error(error);
    }

    if (!response) {
        continue;
    }

    const relevantInfo: SongTags = {
        "title": song.fileSongTitle,
        "artist": song.fileSongArtist,
        "album": response.tracks.items[0].album.name,
        "trackNumber": response.tracks.items[0].track_number.toString(),
        "year": response.tracks.items[0].album.release_date.slice(0, 4),
    }

    const image = await getImageBuffer(response.tracks.items[0].album.images[0].url).catch(() => undefined);

    const imageData = image ? {
        mime: 'image/jpeg',
        description: 'front cover',
        type: {
            id: 3,
            name: 'front cover'
        },
        imageBuffer: image
    } : undefined;

    const tags: NodeID3.Tags = relevantInfo;

    if (imageData) {
        tags.image = imageData;
    }

    const result = NodeID3.write(tags, song.path);

    if (result === true) {
        console.log('✅ ' + song.fileNameNoExtension);
    } else {
        console.log('❌ ' + song.fileNameNoExtension + result.message);
    }

}