import { error, redirect, type LoadEvent } from "@sveltejs/kit";
import ytdl from 'ytdl-core'
import ytsr from 'ytsr'

export async function load({ url }: LoadEvent) {
  const watchId = url.searchParams.get("w");
  if (watchId === null) {
    throw error(400, "Missing 'w' query parameter");
  }

  const match = new RegExp(
    /(?<=(\?|&)v=)([a-zA-Z0-9-_]){11}|(?<!.)(([a-zA-Z0-9-_]){11})(?!.)/g
  ).exec(watchId);

  if (match === null) { 
    throw redirect(300, "/search/?q=" + watchId);
  }

  const result = await ytdl.getInfo(
    `https://www.youtube.com/watch?v=${match[0]}`,
    {}
  );

  const format = ytdl.chooseFormat(result.formats, {
    filter: (x) => x.hasAudio && !x.hasVideo,
    quality: "highestaudio",
  })

  const data = {
    videoDetails: result.videoDetails,
    format,
    related_videos: result.related_videos,
  }

  return {
    result: JSON.parse(JSON.stringify(data)), // Serialization issue, Only work around I'm able to think of at 12pm
  };
}