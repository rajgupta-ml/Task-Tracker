import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);


export const makeTwilioCallPersistence = async (data: string) => {

    try {
      
        const response = await client.calls.create({
            url: 'http://demo.twilio.com/docs/voice.xml',
            to: `91${data}`,
            from: '+15163465562'
        });

        console.log(response);

    } catch (error) {
        throw error;
    }
};
