import AWS from 'aws-sdk';
import mysql from 'mysql2/promise';
const s3 = new AWS.S3();
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

export const handler = async (event) => {
    console.log({event})
    const bucket = 'csci-5409-photogallery-bucket';
   const secret_name = "RDSsecrets";
    const secret_name_1 = "rds/connection";

    // Log the incoming event to understand its structure
    console.log('Incoming event:', JSON.stringify(event, null, 2));

    // Check if queryStringParameters and key are defined
    // if (!event.queryStringParameters || !event.queryStringParameters.key) {
    //     return {
    //         statusCode: 400,
    //         headers: {
    //             'Access-Control-Allow-Origin': '*',
    //             'Access-Control-Allow-Methods': 'GET,OPTIONS,DELETE',
    //             'Access-Control-Allow-Headers': 'Content-Type',
    //         },
    //         body: JSON.stringify({ message: 'Invalid key parameter' }),
    //     };
    // }
    const client = new SecretsManagerClient({
        region: "us-east-1",
    });

    let response;
    // let connection_response;
    console.log(event);
    const key = event.imageUrl.replace(`https://${bucket}.s3.amazonaws.com/`, '');

    try {
        const deleteParams = {
            Bucket: bucket,
            Key: key,
        };

        await s3.deleteObject(deleteParams).promise();
        console.log('Attempting to connect to the database...');
        try {
        response = await client.send(
            new GetSecretValueCommand({
              SecretId: secret_name,
              VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
            })
        );
        // connection_response = await client.send(
        // new GetSecretValueCommand({
        //   SecretId: secret_name_1,
        //   VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
        // })
        // );
        } catch (error) {
          // For a list of exceptions thrown, see
          // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
          throw error;
        }

       const secret = response.SecretString;
        // const connection_secret = connection_response.SecretString;
        
        console.log(secret +"secret");
        // console.log(connection_secret +"secret");
        const secretJson = JSON.parse(secret);
        // const connectionSecretJson = JSON.parse(connection_secret);
        const rdsUsername = secretJson.username;
        const rdsPassword = secretJson.password;
        console.log(rdsUsername);
        const rdsHost = secretJson.host;
        const rdsDatabase = secretJson.dbname;
        
        
        // const rdsHost = connectionSecretJson.rds_connection;
        // const rdsDatabase = connectionSecretJson.rds_database;

        // Database connection
        const connection = await mysql.createConnection({
            host: rdsHost, 
            user: rdsUsername, 
            password: rdsPassword, 
            database: rdsDatabase 
        });
        console.log('Connected to the database.');

        // Delete image record from the userImage table
        const imageUrl = `https://${bucket}.s3.amazonaws.com/${key}`;
        const deleteQuery = 'DELETE FROM user_image WHERE image_url = ?';
        await connection.execute(deleteQuery, [imageUrl]);

        // Close the database connection
        await connection.end();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Image deleted successfully' }),
        };
        } catch (error) {
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Error deleting image', error }),
            };
        }
};
