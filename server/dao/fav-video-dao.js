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

  async createFavoriteVideo(favoriteVideo) {
    let favoritevideolist = await this._loadAllFavoriteVideos();
    let currentFavoriteVideo = favoritevideolist.find(
        (item) => item.shortName === favoriteVideo.shortName
    );
    if (currentFavoriteVideo) {
      throw `subject with shortName ${favoriteVideo.shortName} already exists in db`;
    }
    favoriteVideo.id = crypto.randomBytes(8).toString("hex");
    favoritevideolist.push(favoriteVideo);
    await wf(this._getStorageLocation(), JSON.stringify(favoritevideolist, null, 2));
    return favoriteVideo;
  }

  async getFavoriteVideo(id) {
    let favoritevideolist = await this._loadAllFavoriteVideos();
    const result = favoritevideolist.find((b) => b.id === id);
    return result;
  }
  

  async updateFavoriteVideo(favoriteVideo) {
    let favoritevideolist = await this._loadAllFavoriteVideos();
    const videoIndex = favoritevideolist.findIndex((b) => b.id === favoriteVideo.id);
    if (videoIndex < 0) {
      throw new Error(`subject with given id ${favoriteVideo.id} does not exists`);
    } else {
      favoritevideolist[videoIndex] = {
        ...favoritevideolist[videoIndex],
        ...favoriteVideo,
      };
    }
    await wf(this._getStorageLocation(), JSON.stringify(favoritevideolist, null, 2));
    return favoritevideolist[videoIndex];
  }

  async deleteFavoriteVideo(id) {
    let videolist = await this._loadAllFavoriteVideos();
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
  

  async listFavoriteVideos() {
    let favoritevideolist = await this._loadAllFavoriteVideos();
    return favoritevideolist;
  }

  async _loadAllFavoriteVideos() {
    let favoritevideolist;
    try {
      favoritevideolist = JSON.parse(await rf(this._getStorageLocation()));
    } catch (e) {
      if (e.code === "ENOENT") {
        console.info("No storage found, initializing new one...");
        favoritevideolist = [];
      } else {
        throw new Error(
            "Unable to read from storage. Wrong data format. " +
            this._getStorageLocation()
        );
      }
    }
    return favoritevideolist;
  }

  _getStorageLocation() {
    return this.favoriteVideoStoragePath;
  }
}

module.exports = FavoriteVideoDao;
