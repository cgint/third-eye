import { remote_logger } from "$lib/constants";

export async function logError(title: string, message: string) {
    const logMessage = message.slice(0, 1000);
    console.error(title, logMessage);
    await remote_logger.log('error', title + ' - ' + logMessage);
}

export async function logInfo(title: string, message: string) {
    const logMessage = message.slice(0, 1000);
    console.info(title, logMessage);
    await remote_logger.log('info', title + ' - ' + logMessage);
}

export async function logMetric(metricType: string, metricData: Record<string, any>, userId: string, userSource: string) {
    await remote_logger.logMetric(metricType, metricData, userId, userSource);
}

