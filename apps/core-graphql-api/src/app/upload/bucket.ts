import S3 = require('aws-sdk/clients/s3');

export const bucket = "picture";

export const s3 = new S3({
  endpoint: "http://192.168.1.95:9000",
  accessKeyId: "minio",
  secretAccessKey: "dFZ7ZsY8z2pT",
  sslEnabled: false,
  s3ForcePathStyle: true,
});
