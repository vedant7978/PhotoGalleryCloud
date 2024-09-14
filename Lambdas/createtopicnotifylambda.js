const { SNSClient, CreateTopicCommand, ListTopicsCommand, ListSubscriptionsByTopicCommand, SubscribeCommand, PublishCommand, SetTopicAttributesCommand} = require("@aws-sdk/client-sns");

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
            
            // Set the display name of the topic
            const setTopicAttributesCommand = new SetTopicAttributesCommand({
                TopicArn: topicArn,
                AttributeName: 'DisplayName',
                AttributeValue: 'Photo Gallery App'
            });
            await snsClient.send(setTopicAttributesCommand);
        }

        return topicArn;
    } catch (error) {
        console.error('Error creating or retrieving topic:', error);
        throw error;
    }
};

const subscribeEmailToTopic = async (topicArn, email) => {
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
            // Publish a welcome message to the topic
            const publishCommand = new PublishCommand({
                TopicArn: topicArn,
                Message: 'Welcome to the Gallery App! Start storing your memories in the gallery which you will never lose.',
                Subject: 'Welcome to the Gallery App'
            });
            await snsClient.send(publishCommand);

            return {
                statusCode: 200,
                body: JSON.stringify({ message: "Welcome message sent successfully." })
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

exports.handler = async (event) => {
    const { email } = JSON.parse(event.body);

    if (!email) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Email is required' })
        };
    }

    try {
        const topicArn = await createOrRetrieveTopic(email);
        return await subscribeEmailToTopic(topicArn, email);
    } catch (error) {
        console.error('Error processing request:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error', error: error.message })
        };
    }
};
