import { secKey } from "$lib/utils/KeySec";

export interface RemoteLogger {
    log(level: string, message: string): Promise<boolean>;
    logMetric(metricType: string, metricData: Record<string, any>, userId: string, userSource: string): Promise<boolean>;
}

export class NoopLogger implements RemoteLogger {
    async log(level: string, message: string): Promise<boolean> {
        console.log(`NoopLogger: ${level} ${message}`);
        return Promise.resolve(true);
    }

    async logMetric(metricType: string, metricData: Record<string, any>, userId: string, userSource: string): Promise<boolean> {
        console.log(`NoopLogger metric: ${metricType}`, metricData);
        return Promise.resolve(true);
    }
}

/**
 * POST to https://eu-logs.ai4you.app/logs
 * with header ACCESS_KEY: 
 * { 
 * "log_line": "User login successful",
 * "timestamp": "2024-04-19T14:30:00.000Z",
 * "log_level": "info",
 * "service_name": "auth-service"
 * }
 */
export class RemoteRestLogger implements RemoteLogger {
    private readonly baseUrl: string;
    private readonly timeoutMs = 10000; // 10 seconds
    private readonly senderId: string;
    private readonly password: string;

    constructor(serverBaseUrl: string, password: string, senderId: string) {
        console.log(`RemoteRestLogger constructor: ${serverBaseUrl} ${secKey(password)} ${senderId}`);
        this.baseUrl = serverBaseUrl.replace(/\/$/, '');
        this.senderId = senderId || '';
        this.password = password || '';
    }

    async log(level: string, message: string): Promise<boolean> {
        try {
            console.log(`Logging message: ${message}`);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

            const response = await fetch(`${this.baseUrl}/log`, {
                method: 'POST',
                headers: {
                    'User-Agent': 'RemoteRestLogger',
                    'Content-Type': 'application/json',
                    'Access-Key': this.password
                },
                body: JSON.stringify({
                    log_line: message,
                    timestamp: new Date().toISOString(),
                    log_level: level,
                    service_name: this.senderId
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                console.error(`Logging failed with status ${response.status}: ${await response.text()}`);
                return false;
            }
            console.log(`Logging successful: ${message}`);

            return true;

        } catch (error) {
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    console.error('Logging request timed out after 10 seconds');
                } else {
                    console.error('Error sending log:', error.message);
                }
            }
            return false;
        }
    }

    async logMetric(metricType: string, metricData: Record<string, any>, userId: string, userSource: string): Promise<boolean> {
        try {
            console.log(`Logging metric: ${metricType}`);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

            const metricPayload = {
                service_name: this.senderId,
                timestamp: new Date().toISOString(),
                metric_type: metricType,
                metric_data: metricData,
                user_id: userId,
                user_source: userSource
            };

            const response = await fetch(`${this.baseUrl}/metric`, {
                method: 'POST',
                headers: {
                    'User-Agent': 'RemoteRestLogger',
                    'Content-Type': 'application/json',
                    'Access-Key': this.password
                },
                body: JSON.stringify(metricPayload),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                console.error(`Metric logging failed with status ${response.status}: ${await response.text()}`);
                return false;
            }
            console.log(`Metric logging successful: ${metricType}`);

            return true;

        } catch (error) {
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    console.error('Metric logging request timed out after 10 seconds');
                } else {
                    console.error('Error sending metric:', error.message);
                }
            }
            return false;
        }
    }
}
