import S3 = require('aws-sdk/clients/s3');

export const bucket = "dev-gql-s3-bucket";

export const s3 = new S3({
  endpoint: "http://localhost:9000",
  accessKeyId: "ly1y6iMtYf",
  secretAccessKey: "VNcmMuDARGGstqzkXF1Van1Mlki5HGU9",
  sslEnabled: false,
  s3ForcePathStyle: true,
});
