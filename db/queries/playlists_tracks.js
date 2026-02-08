import db from "#db/client";

export async function createPlaylistTrack(playlistId, trackId) {
  const sql = `
  INSERT INTO playlists_tracks
    (playlist_id, track_id)
  VALUES
    ($1, $2)
  RETURNING *
  `;
  const {
    rows: [playlistTrack],
  } = await db.query(sql, [playlistId, trackId]);
  return playlistTrack;
}

export const getPlaylistsByTrackId = async (trackId, userId) => {
  const sql = `
    SELECT playlists.* FROM tracks
    JOIN playlists_tracks ON tracks.id = playlists_tracks.track_id
    JOIN playlists ON playlists_tracks.playlist_id = playlists.id
    WHERE tracks.id = $1
    AND user_id = $2
  `;

  const { rows: playlists } = await db.query(sql, [trackId, userId]);
  console.log(playlists)
  return playlists;
}
