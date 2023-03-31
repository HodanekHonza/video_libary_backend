const path = require("path");
const Ajv = require("ajv").default;
const FavoriteVideoDao = require("../../dao/fav-video-dao");
let dao = new FavoriteVideoDao(
    path.join(__dirname, "..", "..", "storage", "favoritevideos.json")
);

let schema = {
    type: "object",
    properties: {
        url: { type: "string" },
        name: { type: "string" },
        creator: { type: "string" },
        length: { type: "number" },
        dateofcreation: { type: "date" },
        topic: { type: "string" },
        description: { type: "string" },
    },
    required: ["name", "url"],
};


async function UpdateAbl(req, res) {
    try { 
        const ajv = new Ajv();
        let video = req.body;
        const valid = ajv.validate(schema, video);
        if (valid) {
            video = await dao.updateFavoriteVideo(video);
            res.json(video);
        } else {
            res.status(400).send({
                errorMessage: "validation of input failed",
                params: video,
                reason: ajv.errors,
            });
        }
    } catch (e) {
        if (e.message.startsWith("favorite video with given id")) {
            res.status(400).json({ error: e.message });
        }
        res.status(500).send(e);
    }
}

module.exports = UpdateAbl;
