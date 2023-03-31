const path = require("path");
const Ajv = require("ajv").default;
const FavoriteVideoDao = require("../../dao/fav-video-dao");
let dao = new FavoriteVideoDao(
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
