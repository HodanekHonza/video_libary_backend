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
        dateofcreation: { type: "number" },
        topic: { type: "string" },
        description: { type: "string" },
    },
    required: ["url", "name"],
};

async function CreateAbl(req, res) {
    try {
        const ajv = new Ajv();
        const valid = ajv.validate(schema, req.body);
        if (valid) {
            let video = req.body;
            video = await dao.createFavoriteVideo(video);
            res.json(video);
        } else {
            res.status(400).send({
                errorMessage: "validation of input failed",
                params: req.body,
                reason: ajv.errors,
            });
        }
    } catch (e) {
        if (e.includes("subject with name ")) {
            res.status(400).send({ errorMessage: e, params: req.body });
        } else {
            res.status(500).send(e);
        }
    }
}

module.exports = CreateAbl;
