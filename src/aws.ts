import AWS = require('aws-sdk');
import { config } from './config/config';// from our config file.

const c = config.dev;

//Configure AWS
var credentials = new AWS.SharedIniFileCredentials({ profile:c.aws_profile});// profile:'default'
AWS.config.credentials = credentials;

//+++++
if(c.aws_profile!=="DEPLOYED"){
  var credentials = new AWS.SharedIniFileCredentials({ profile:c.aws_profile});
  AWS.config.credentials = credentials;
}

//+++++
/** Here we are using our interface within our AWS service to instantiate that service to use elsewhere  */
export const s3 = new AWS.S3({
  signatureVersion: 'v4',
  region: c.aws_reigion,// we are specifying our region from our config file. 
  params: {Bucket: c.aws_media_bucket}// and the bucket. 
});


/* getGetSignedUrl generates an aws signed url to retreive an item
 * @Params
 *    key: string - the filename to be put into the s3 bucket
 * @Returns:
 *    a url as a string
 */
export function getGetSignedUrl( key: string ): string{
//--
  const signedUrlExpireSeconds = 60 * 5

    const url = s3.getSignedUrl('getObject', {
        Bucket: c.aws_media_bucket,
        Key: key,
        Expires: signedUrlExpireSeconds
      });

    return url;
//-- instead of this block we can also do
/*
const param= {
        Bucket: c.aws_media_bucket,
        Key: key,
        Expires: signedUrlExpireSeconds
      }
onst url = s3.getSignedUrl('getObject', param);
return url;

*/

  
}//-----

/* getPutSignedUrl generates an aws signed url to put an item
 * @Params
 *    key: string - the filename to be retreived from s3 bucket
 * @Returns:
 *    a url as a string
 */
export function getPutSignedUrl( key: string ){

    const signedUrlExpireSeconds = 60 * 5

    const url = s3.getSignedUrl('putObject', {
      Bucket: c.aws_media_bucket,
      Key: key,
      Expires: signedUrlExpireSeconds
    });

    return url;
}