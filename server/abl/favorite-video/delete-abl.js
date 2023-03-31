const path = require("path");
const FavoriteVideoDao = require("../../dao/fav-video-dao");
let dao = new FavoriteVideoDao(
    path.join(__dirname, "..", "..", "storage", "favoritevideos.json")
);

async function DeleteAbl(req, res) {
    try {
        const videoId = req.params.id;
        await dao.deleteFavoriteVideo(videoId);
        res.json({});
    } catch (e) {
        res.status(500).send(e.message);
    }
}

module.exports = DeleteAbl;
