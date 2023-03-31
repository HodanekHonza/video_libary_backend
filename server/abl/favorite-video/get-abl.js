const path = require("path");
const Ajv = require("ajv").default;
const FavoriteVideoDao = require("../../dao/fav-video-dao");
let dao = new FavoriteVideoDao(
    path.join(__dirname, "..", "..", "storage", "favoritevideos.json")
);

let schema = {
    type: "object",
    properties: {
        id: { type: "string" },
    },
    required: ["id"],
};

async function GetAbl(req, res) {
    try {
        const ajv = new Ajv();
        const body = req.query.id ? req.query : req.body;
        const valid = ajv.validate(schema, body);
        if (valid) {
            const videoId = body.id;
            const video = await dao.getFavoriteVideo(videoId);
            if (!video) {
                res
                    .status(400)
                    .send({ error: `Favorite video with id '${videoId}' doesn't exist.` });
            }
            res.json(video);
        } else {
            res.status(400).send({
                errorMessage: "validation of input failed",
                params: body,
                reason: ajv.errors,
            });
        }
    } catch (e) {
        res.status(500).send(e);
    }
}

module.exports = GetAbl;
