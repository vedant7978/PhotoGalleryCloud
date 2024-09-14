import { SNSClient, CreateTopicCommand, ListTopicsCommand, ListSubscriptionsByTopicCommand, SubscribeCommand, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({ region: "us-east-1" });

const createOrRetrieveTopic = async (email) => {
    const namePart = email.split('@')[0];
    const nameFromEmail = namePart.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const topicName = `gallery-${nameFromEmail}`;
    let topicArn;

    try {
        const listTopicsCommand = new ListTopicsCommand({});
        const listTopicsResponse = await snsClient.send(listTopicsCommand);
        const topics = listTopicsResponse.Topics || [];
        const existingTopic = topics.find(topic => topic.TopicArn.endsWith(topicName));

        if (existingTopic) {
            topicArn = existingTopic.TopicArn;
        } else {
            const createTopicCommand = new CreateTopicCommand({ Name: topicName });
            const createTopicResponse = await snsClient.send(createTopicCommand);
            topicArn = createTopicResponse.TopicArn;
        }

        return topicArn;
    } catch (error) {
        console.error('Error creating or retrieving topic:', error);
        throw error;
    }
};

const subscribeEmailToTopic = async (topicArn, email, imageUrl) => {
    try {
        const listSubscriptionsCommand = new ListSubscriptionsByTopicCommand({ TopicArn: topicArn });
        const listSubscriptionsResponse = await snsClient.send(listSubscriptionsCommand);
        const subscriptions = listSubscriptionsResponse.Subscriptions || [];
        const isSubscribed = subscriptions.some(subscription => subscription.Endpoint === email && subscription.Protocol === 'email' && subscription.SubscriptionArn !== 'PendingConfirmation');

        if (!isSubscribed) {
            const subscribeCommand = new SubscribeCommand({
                TopicArn: topicArn,
                Protocol: 'email',
                Endpoint: email,
                ReturnSubscriptionArn: true
            });
            await snsClient.send(subscribeCommand);

            return {
                statusCode: 200,
                body: JSON.stringify({ message: "Subscription confirmation email sent." })
            };
        } else {
            // Construct the message with the image URL
            const message = `Hello,

Your image has been uploaded successfully.
Image URL: ${imageUrl}

Best Regards,
Gallery App Team`;

            // Publish the notification message to the topic
            const publishCommand = new PublishCommand({
                TopicArn: topicArn,
                Message: message,
                Subject: 'Image Upload Successful'
            });
            await snsClient.send(publishCommand);

            return {
                statusCode: 200,
                body: JSON.stringify({ message: "Upload notification sent successfully." })
            };
        }
    } catch (error) {
        console.error('Error subscribing email to topic:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error', error: error.message })
        };
    }
};

export const handler = async (event) => {
    const { email, imageUrl } = JSON.parse(event.body);
    

    if (!email || !imageUrl) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Email and image URL are required' })
        };
    }

    try {
        const topicArn = await createOrRetrieveTopic(email);
        return await subscribeEmailToTopic(topicArn, email, imageUrl);
    } catch (error) {
        console.error('Error processing request:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error', error: error.message })
        };
    }
};
