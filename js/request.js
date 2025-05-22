export default async function makeRequest({
    url = 'https://linkskool.net/api/v1/keybuddy.php',
    method = 'POST',
    payload = {},
    onSuccess    // Optional: function to run on success
}) {
    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: method !== 'GET' ? JSON.stringify(payload) : undefined,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('API response:', result);

        await onSuccess(result);
    } catch (error) {
        console.error('API error:', error);
    }
}
