interface ApiHelperOptions extends RequestInit {
  body?: any;
}

const apiHelper = async <T>(
  url: string,
  options: ApiHelperOptions = {}
): Promise<T> => {
  const { method = 'GET', headers = {}, body, ...rest } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...rest,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `HTTP error! Status: ${response.status}`,
      }));
      throw new Error(errorData.message || 'An unknown API error occurred.');
    }

    return await response.json();
  } catch (error) {
    console.error('API Helper Error:', error);
    throw error;
  }
};

export default apiHelper;
