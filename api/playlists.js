import express from "express";
const router = express.Router();
export default router;

import {
  createPlaylist,
  getPlaylistById,
  getPlaylists,
} from "#db/queries/playlists";
import { createPlaylistTrack } from "#db/queries/playlists_tracks";
import { getTracksByPlaylistId } from "#db/queries/tracks";
import { getUserIdByToken } from "#db/queries/users";

router.use(express.json())

router.use(async (req, res, next) => {
  try {
    const headerData = req.headers.authorization;
    if (!headerData) return res.status(401).send('You are not authorized');
    const token = headerData.split(' ')[1];
    req.userId = await getUserIdByToken(token);
    next();
  } catch (e) {
    if (e.name === "JsonWebTokenError") return res.status(401).send("You are not authorized");
  }
})

router.get("/", async (req, res) => {
  const { userId } = req;
  const playlists = await getPlaylists(userId);
  res.send(playlists);
});

router.post("/", async (req, res) => {
  const { userId } = req;
  if (!req.body) return res.status(400).send("Request body is required.");

  const { name, description } = req.body;
  if (!name || !description || !userId)
    return res.status(400).send("Request body requires: name, description");

  const playlist = await createPlaylist(name, description, userId);
  res.status(201).send(playlist);
});

router.param("id", async (req, res, next, id) => {
  const { userId } = req;
  const playlist = await getPlaylistById(id);
  if (playlist.user_id !== userId) return res.status(403).send("You are not authorized");
  if (!playlist) return res.status(404).send("Playlist not found.");
  req.playlist = playlist;
  next();
});

router.get("/:id", (req, res) => {
  res.send(req.playlist);
});

router.get("/:id/tracks", async (req, res) => {
  const tracks = await getTracksByPlaylistId(req.playlist.id);
  res.send(tracks);
});

router.post("/:id/tracks", async (req, res) => {
  if (!req.body) return res.status(400).send("Request body is required.");

  const { trackId } = req.body;
  if (!trackId) return res.status(400).send("Request body requires: trackId");

  const playlistTrack = await createPlaylistTrack(req.playlist.id, trackId);
  res.status(201).send(playlistTrack);
});
