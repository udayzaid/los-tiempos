const BASE_URL = 'https://lostiemposapi20260817104248-avbkfhcfcucgf9e0.centralus-01.azurewebsites.net';

// Helper para obtener encabezados y Token de sesión.
// Durante la migración mantenemos el token antiguo como compatibilidad,
// pero las peticiones también envían las cookies HttpOnly mediante include.
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

// Configuración común para que el navegador envíe las cookies HttpOnly
// de la sesión con las peticiones al backend.
const fetchOptions = (requireAuth = false): RequestInit => ({
  credentials: 'include',
  headers: getHeaders(requireAuth),
});

export const api = {
  // 0. GET / -> Endpoint base de salud/inicio
  getPrimer: async () => {
    try {
      const res = await fetch(`${BASE_URL}/`, {
        ...fetchOptions(false),
        method: 'GET',
      });
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      return await res.text();
    } catch (error) {
      console.error('Error en getPrimer:', error);
      return 'Servidor en línea';
    }
  },

  // 1. GET /stream -> Consulta la transmisión disponible para la vista pública.
  getStream: async () => {
    try {
      const res = await fetch(`${BASE_URL}/stream`, {
        ...fetchOptions(false),
        method: 'GET',
      });

      if (!res.ok) {
        return { url: '', raw: null, hasActiveStream: false };
      }

      const data = await res.json();

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

  // 2. POST /api/Stream -> Crea e inicia la transmisión.
  createStream: async (data: { titulo: string; descripcion: string }) => {
    const res = await fetch(`${BASE_URL}/api/Stream`, {
      ...fetchOptions(true),
      method: 'POST',
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

  // Compatibilidad temporal: admin/index.tsx todavía utiliza postStream.
  postStream: async (data: { titulo: string; descripcion: string }) => {
    return api.createStream(data);
  },

  // 3. DELETE /api/Stream -> Finaliza y borra la transmisión activa.
  deleteStream: async () => {
    const res = await fetch(`${BASE_URL}/api/Stream`, {
      ...fetchOptions(true),
      method: 'DELETE',
    });

    const resData = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(resData?.message || resData?.mensaje || `Error en DELETE (${res.status})`);
    }

    return resData;
  },
};