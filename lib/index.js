"use strict";

/**
 * Module dependencies
 */

/* eslint-disable import/no-unresolved */
/* eslint-disable no-unused-vars */
// Public node modules.
const _ = require("lodash");
const AWS = require("aws-sdk");

module.exports = {
  provider: "digitalocean",
  name: "Digitalocean Spaces service",
  auth: {
    key: {
      label: "Key",
      type: "text"
    },
    secret: {
      label: "Secret",
      type: "text"
    },
    region: {
      label: "Region",
      type: "enum",
      values: ["nyc3", "sgp1", "ams3", "sfo2"]
    },
    space: {
      label: "Space",
      type: "text"
    }
  },
  init: config => {
    AWS.config.update({
      accessKeyId: config.key,
      secretAccessKey: config.secret,
      region: config.region
    });

    const S3 = new AWS.S3({
      params: {
        Bucket: config.space
      }
    });

    return {
      upload: file => {
        return new Promise((resolve, reject) => {
          const path = file.path ? `${file.path}/` : "";
          S3.upload(
            {
              Key: `${path}${file.hash}${file.ext}`,
              Body: new Buffer(file.buffer, "binary"),
              ACL: "public-read",
              ContentType: file.mime
            },
            (err, data) => {
              if (err) {
                return reject(err);
              }
              file.url = data.Location;
              resolve();
            }
          );
        });
      },
      delete: file => {
        return new Promise((resolve, reject) => {
          const path = file.path ? `${file.path}/` : "";
          S3.deleteObject(
            {
              Key: `${path}${file.hash}${file.ext}`
            },
            (err, data) => {
              if (err) {
                return reject(err);
              }
              resolve();
            }
          );
        });
      }
    };
  }
};