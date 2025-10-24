// src/lib/firebase.ts
import admin from "firebase-admin";

const serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64!, 'base64').toString('utf-8')
);



admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

export const sendPushNotification = async (fcmToken: string, senderXMPPId: string, message: string) => {
    try {
        const notificationMessage = {
            token: fcmToken,
            notification: {
                title: "New Message from " + senderXMPPId,
                body: message,
            },
        };

        const response = await admin.messaging().send(notificationMessage);
        console.log("Successfully sent message:", response);
    } catch (error) {
        console.error("Error sending message:", error);
    }
};
