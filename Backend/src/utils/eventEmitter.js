import { EventEmitter } from 'node:events';
import { sendEmail } from './sendEmailService.js'



const myEmitter = new EventEmitter()


myEmitter.on('userRegistered', async (user) => {
    try {
        await sendEmail(user)
    } catch (error) {
        console.error("Event Emitter caught an error while sending email:", error.message);
    }
})

export {myEmitter}