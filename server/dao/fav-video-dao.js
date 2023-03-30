"use strict";
const fs = require("fs");
const path = require("path");

const crypto = require("crypto");

const rf = fs.promises.readFile;
const wf = fs.promises.writeFile;

const DEFAULT_STORAGE_PATH = path.join(__dirname, "storage", "favoritevideos.json");

class FavoriteVideoDao {
  constructor(storagePath) {
    this.favoriteVideoStoragePath = storagePath ? storagePath : DEFAULT_STORAGE_PATH;
  }

  async createFavoriteVideo(video) {
    let videolist = await this._loadAllFavoriteVideos();
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

  async getFavoriteVideo(id) {
    let videolist = await this._loadAllFavoriteVideos();
    const result = videolist.find((b) => b.id === id);
    return result;
  }
  

  async updateFavoriteVideo(video) {
    let videolist = await this._loadAllFavoriteVideos();
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

  async deleteFavoriteVideo(id) {
    let videolist = await this._loadAllFavoriteVideos();
    const favoriteVideoIndex = videolist.findIndex((b) => b.id === id);
    if (favoriteVideoIndex >= 0) {
      videolist.splice(favoriteVideoIndex, 1);
    }
    await wf(this._getStorageLocation(), JSON.stringify(videolist, null, 2));
    return {};
  }

  async listFavoriteVideos() {
    let videolist = await this._loadAllFavoriteVideos();
    return videolist;
  }

  async _loadAllFavoriteVideos() {
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
    return this.favoriteVideoStoragePath;
  }
}

module.exports = FavoriteVideoDao;
