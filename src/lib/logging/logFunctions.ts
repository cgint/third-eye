import { remote_logger, MAX_LOG_MESSAGE_LENGTH, MAX_STACK_TRACE_LENGTH } from "$lib/constants";

export async function logError(title: string, message: string) {
    const logMessage = message.slice(0, MAX_LOG_MESSAGE_LENGTH);
    console.error(title, logMessage);
    await remote_logger.log('error', title + ' - ' + logMessage);
}

export async function logInfo(title: string, message: string) {
    const logMessage = message.slice(0, MAX_LOG_MESSAGE_LENGTH);
    console.info(title, logMessage);
    await remote_logger.log('info', title + ' - ' + logMessage);
}

export async function logMetric(metricType: string, metricData: Record<string, any>, userId: string, userSource: string) {
    await remote_logger.logMetric(metricType, metricData, userId, userSource);
}

export async function logStackTrace(error: Error, logTitle: string) {
    const stackTrace = error.stack || 'No stack trace available';
    const truncatedStackTrace = stackTrace.length > MAX_STACK_TRACE_LENGTH
        ? stackTrace.substring(0, MAX_STACK_TRACE_LENGTH) + '...'
        : stackTrace;
    await logError(logTitle, `Stack trace: ${truncatedStackTrace}`);
}

