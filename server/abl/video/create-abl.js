const path = require("path");
const Ajv = require("ajv").default;
const VideoDao = require("../../dao/video-dao");
let dao = new VideoDao(
    path.join(__dirname, "..", "..", "storage", "videos.json")
);

let schema = {
    type: "object",
    properties: {
        name: { type: "string" },
        shortName: { type: "string" },
        description: { type: "string" },
    },
    required: ["name", "shortName"],
};

async function CreateAbl(req, res) {
    try {
        const ajv = new Ajv();
        const valid = ajv.validate(schema, req.body);
        if (valid) {
            let video = req.body;
            video = await dao.createVideo(video);
            res.json(video);
        } else {
            res.status(400).send({
                errorMessage: "validation of input failed",
                params: req.body,
                reason: ajv.errors,
            });
        }
    } catch (e) {
        if (e.includes("subject with shortName ")) {
            res.status(400).send({ errorMessage: e, params: req.body });
        } else {
            res.status(500).send(e);
        }
    }
}

module.exports = CreateAbl;
