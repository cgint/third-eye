export interface RemoteLogger {
    log(level: string, message: string): Promise<boolean>;
}

export class NoopLogger implements RemoteLogger {
    log(level: string, message: string): Promise<boolean> {
        console.log(`NoopLogger: ${message}`);
        return Promise.resolve(true);
    }
}

export class RemoteRestLogger implements RemoteLogger {
    private readonly baseUrl: string;
    private readonly timeoutMs = 10000; // 10 seconds
    private readonly senderId: string;
    private readonly password: string;

    constructor(serverBaseUrl: string, password: string, senderId: string) {
        // Ensure trailing slash is removed
        this.baseUrl = serverBaseUrl.replace(/\/$/, '');
        this.senderId = senderId;
        this.password = password;
    }

    async log(level: string, message: string): Promise<boolean> {
        try {
            console.log(`Logging message: ${message}`);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

            const response = await fetch(`${this.baseUrl}/logging/sender_id/${this.senderId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'password': this.password
                },
                body: JSON.stringify({
                    level,
                    message
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
}
