"use strict";
const fs = require("fs");
const path = require("path");

const crypto = require("crypto");

const rf = fs.promises.readFile;
const wf = fs.promises.writeFile;

const DEFAULT_STORAGE_PATH = path.join(__dirname, "storage", "videos.json");

class VideoDao {
  constructor(storagePath) {
    this.videoStoragePath = storagePath ? storagePath : DEFAULT_STORAGE_PATH;
  }

  async createVideo(video) {
    let videolist = await this._loadAllVideos();
    let currentSubject = videolist.find(
        (item) => item.shortName === video.shortName
    );
    if (currentSubject) {
      throw `subject with shortName ${video.shortName} already exists in db`;
    }
    video.id = crypto.randomBytes(8).toString("hex");
    videolist.push(video);
    await wf(this._getStorageLocation(), JSON.stringify(videolist, null, 2));
    return video;
  }

  async getVideo(id) {
    let videolist = await this._loadAllVideos();
    const result = videolist.find((b) => b.id === id);
    return result;
  }

  async updateVideo(video) {
    let videolist = await this._loadAllVideos();
    const videoIndex = videolist.findIndex((b) => b.id === video.id);
    if (videoIndex < 0) {
      throw new Error(`subject with given id ${video.id} does not exists`);
    } else {
      videolist[videoIndex] = {
        ...videolist[videoIndex],
        ...video,
      };
    }
    await wf(this._getStorageLocation(), JSON.stringify(videolist, null, 2));
    return videolist[videoIndex];
  }

  async deleteVideo(id) {
    let videolist = await this._loadAllVideos();
    console.log("Original video list:", videolist);
    const videoIndex = videolist.findIndex((b) => b.id === id);
    console.log("Index of video to delete:", videoIndex);
    if (videoIndex >= 0) {
      videolist.splice(videoIndex, 1);
    } else {
      console.log("Video not found, not deleting.");
    }
    await wf(this._getStorageLocation(), JSON.stringify(videolist, null, 2));
    console.log("Updated video list:", videolist);
    return {};
  }
  

  async listVideos() {
    let videolist = await this._loadAllVideos();
    return videolist;
  }

  async _loadAllVideos() {
    let videolist;
    try {
      videolist = JSON.parse(await rf(this._getStorageLocation()));
    } catch (e) {
      if (e.code === "ENOENT") {
        console.info("No storage found, initializing new one...");
        videolist = [];
      } else {
        throw new Error(
            "Unable to read from storage. Wrong data format. " +
            this._getStorageLocation()
        );
      }
    }
    return videolist;
  }

  _getStorageLocation() {
    return this.videoStoragePath;
  }
}

module.exports = VideoDao;
