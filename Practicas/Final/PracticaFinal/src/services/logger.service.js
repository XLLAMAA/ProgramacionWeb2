import pino from 'pino';
import axios from 'axios';
import config from '../config/index.js';

//Informacion de los logs, colorres y fecha
const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname'
        }
    }
});

//Webhook de slack
const webhook = process.env.SLACK_WEBHOOK_URL
    ? new IncomingWebhook(process.env.SLACK_WEBHOOK_URL)
    : null

//Funciones de logging

//Log normal
export const logInfo = (message, data = {}) => {
    logger.info(data, message);
};

//Log de errores con stack
export const logError = (message, error = {}, data = {}) => {
    logger.error({ ...data, error }, message);
};

//Advertencias
export const logWarning = (message, data = {}) => {
    logger.warn(data, message);
};

//Log con detalles 
export const logDebug = (message, data = {}) => {
    logger.debug(data, message);
};

//Errores >500
export const sendSlackError = async (statusCode, method, url, message, stack) => {
    if (statusCode < 500 || !webhook) return;

    try {
        await webhook.send({
            attachments: [
                {
                    color: 'danger',
                    title: `🚨 Error ${statusCode} en Practica final`,
                    fields: [
                        { title: 'Metodo', value: method, short: true },
                        { title: 'Ruta', value: url, short: true },
                        { title: 'Mensaje', value: message, short: false },
                        { title: 'Stack Trace', value: `\`\`\`${stack.substring(0, 500)}...\`\`\``, short: false },
                        { title: 'Timestamp', value: new Date().toISOString(), short: true }
                    ]
                }
            ]
        });
        logInfo('Error 5XX enviado a Slack', { statusCode, url });
    } catch (slackError) {
        logError('Error al enviar a Slack', slackError);
    }
};

export default logger;