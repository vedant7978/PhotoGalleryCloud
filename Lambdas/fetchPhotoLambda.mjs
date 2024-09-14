import AWS from 'aws-sdk';
const s3 = new AWS.S3();

export const handler = async (event) => {
    const bucket = 'csci-5409-photogallery-bucket';
    console.log({event})

    // Log the incoming event to understand its structure
    console.log('Incoming event:', JSON.stringify(event, null, 2));

    // Check if queryStringParameters and key are defined
    // if (!event.queryStringParameters || !event.queryStringParameters.key) {
    //     return {
    //         statusCode: 400,
    //         headers: {
    //             'Access-Control-Allow-Origin': '*',
    //             'Access-Control-Allow-Methods': 'GET,OPTIONS',
    //             'Access-Control-Allow-Headers': 'Content-Type',
    //         },
    //         body: JSON.stringify({ message: 'Invalid key parameter' }),
    //     };
    // }

    // const key = event;

    try {
        const headParams = {
            Bucket: bucket,
            Key: event.key.replace(`https://${bucket}.s3.amazonaws.com/`, ''), 
        };

        const data = await s3.headObject(headParams).promise();
        const imageUrl = event.key;
        const sizeInBytes = data.ContentLength;
        const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2); // Convert to MB and format to 2 decimal places
        const lastModified = data.LastModified.toISOString(); // Format last modified date


        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: JSON.stringify({
                url: imageUrl,
                metadata: data.Metadata,
                contentType: data.ContentType,
                contentLength: sizeInBytes, // Size in bytes
                contentLengthMB: sizeInMB, // Size in MB
                lastModified: lastModified, // Date and time when the image was last modified
            }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error fetching image details', error }),
        };
    }
};
