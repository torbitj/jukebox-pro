import express from "express";
const router = express.Router();
export default router;

import { getTracks, getTrackById } from "#db/queries/tracks";
import { getPlaylistsByTrackId } from "#db/queries/playlists_tracks";
import { getUserIdByToken } from '#db/queries/users';

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

router.param('id', async(req, res, next) => {
  const track = await getTrackById(req.params.id);
  if (!track) return res.status(404).send("Track not found.");
  req.track = track;
  next();
})

router.get("/", async (req, res) => {
  const tracks = await getTracks();
  res.send(tracks);
});

router.get("/:id", async (req, res) => {
  const { track } = req;
  res.send(track);
});

router.get('/:id/playlists', async (req, res, next) => {
  const { track, userId } = req;
  const trackId = track.id;
  const playlists = await getPlaylistsByTrackId(trackId, userId);
  res.send(playlists)
})
