export const API_URL = 'http://localhost:3333';

interface RequestOptions extends RequestInit {
    body?: any;
}

async function httpClient(endpoint: string, { body, ...customConfig }: RequestOptions = {}) {
    const headers = { 'Content-Type': 'application/json' };

    const config: RequestInit = {
        method: body ? 'POST' : 'GET',
        ...customConfig,
        headers: {
            ...headers,
            ...customConfig.headers,
            'Authorization': `Bearer ${localStorage.getItem('@Solicitacoes:token')}`,
        },
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_URL}${endpoint}`, config);

    if (!response.ok) {
        const errorMessage = await response.text();
        return Promise.reject(new Error(errorMessage || 'Something went wrong'));
    }


    if (response.status === 204) {
        return null;
    }

    const data = await response.json();
    return data;
}

export const api = {
    get: (endpoint: string, options?: RequestOptions) => httpClient(endpoint, { ...options, method: 'GET' }),
    post: (endpoint: string, body: any, options?: RequestOptions) => httpClient(endpoint, { ...options, body, method: 'POST' }),
    put: (endpoint: string, body: any, options?: RequestOptions) => httpClient(endpoint, { ...options, body, method: 'PUT' }),
    delete: (endpoint: string, options?: RequestOptions) => httpClient(endpoint, { ...options, method: 'DELETE' }),
};
