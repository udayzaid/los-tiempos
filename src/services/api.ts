const BASE_URL = 'https://lostiemposapi20260817104248-avbkfhcfcucgf9e0.centralus-01.azurewebsites.net';

// Helper para obtener encabezados y Token de sesión
const getHeaders = (requireAuth = false) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (requireAuth) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

export const api = {
  // 0. GET / -> Endpoint base de salud/inicio
  getPrimer: async () => {
    try {
      const res = await fetch(`${BASE_URL}/`, {
        method: 'GET',
        headers: getHeaders(false),
      });
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      return await res.text();
    } catch (error) {
      console.error('Error en getPrimer:', error);
      return 'Servidor en línea';
    }
  },

  // 1. GET /api/Stream -> Consulta el estado activo del streaming en Azure
  getStream: async () => {
    try {
      // CORREGIDO: Se agregó /api/Stream
      const res = await fetch(`${BASE_URL}/api/Stream`, {
        method: 'GET',
        headers: getHeaders(false),
      });

      if (!res.ok) {
        // Si responde 404/400 es porque no hay transmisión activa
        return { url: '', raw: null, hasActiveStream: false };
      }

      const data = await res.json();

      // CORREGIDO: 'embedUrl' corregido con la letra 'd'
      const videoUrl =
        data?.embedUrl ||
        data?.embeUrl ||
        data?.watchUrl ||
        data?.link ||
        data?.url ||
        (typeof data === 'string' ? data : '');

      return {
        url: videoUrl,
        raw: data,
        hasActiveStream: Boolean(videoUrl && videoUrl.trim().length > 0),
      };
    } catch (error) {
      console.error('Error en getStream:', error);
      return { url: '', raw: null, hasActiveStream: false };
    }
  },

  // 2. POST /api/Stream -> Crea e inicia la transmisión
  createStream: async (data: { titulo: string; descripcion: string }) => {
    const res = await fetch(`${BASE_URL}/api/Stream`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({
        titulo: data.titulo,
        descripcion: data.descripcion,
      }),
    });

    const resData = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(resData?.message || resData?.mensaje || `Error en POST (${res.status})`);
    }

    return resData;
  },

  // 3. Alias postStream
  postStream: async (data: { titulo: string; descripcion: string }) => {
    return await api.createStream(data);
  },

  // 4. DELETE /api/Stream -> Finaliza y borra la transmisión activa
  deleteStream: async () => {
    const res = await fetch(`${BASE_URL}/api/Stream`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });

    const resData = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(resData?.message || resData?.mensaje || `Error en DELETE (${res.status})`);
    }

    return resData;
  },
};