const path = require("path");
const Ajv = require("ajv").default;
const VideoDao = require("../../dao/fav-video-dao");
let dao = new VideoDao(
    path.join(__dirname, "..", "..", "storage", "favoritevideos.json")
);

let schema = {
    type: "object",
    properties: {},
    required: [],
};



async function ListAbl(req, res) {
    try {
        const videos = await dao.listFavoriteVideos();
        res.json(videos);
    } catch (e) {
        res.status(500).send(e);
    }
}

module.exports = ListAbl;
