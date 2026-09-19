import { StreamCredentials } from '@/components/admin/StreamCredentialsModal';

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

export type ChatHistoryMessage = {
  id: string;
  userId?: string;
  userName?: string;
  username?: string;
  avatarColor?: string;
  message?: string;
  text?: string;
  createdAt?: string;
};

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

  // 1. GET /api/Stream -> Consulta la transmisión activa para la vista pública.
  // Cuando no existe Live, el backend puede responder { message: 'stream no encontrado' }.
  getStream: async () => {
    try {
      let res = await fetch(`${BASE_URL}/Stream`, {
        ...fetchOptions(false),
        method: 'GET',
      });

      // Compatibilidad: algunos despliegues exponen la consulta pública
      // bajo /api/Stream. Si /Stream no existe, probamos esa ruta.
      if (res.status === 404) {
        res = await fetch(`${BASE_URL}/api/Stream`, {
          ...fetchOptions(false),
          method: 'GET',
        });
      }

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        return { url: '', raw: data, hasActiveStream: false };
      }

      const message = String(data?.message || data?.mensaje || '').toLowerCase();
      if (message.includes('stream no encontrado')) {
        return { url: '', raw: data, hasActiveStream: false };
      }

      // Compatibilidad mientras terminamos de confirmar el JSON exacto
      // que devuelve el backend cuando existe una transmisión activa.
      const videoUrl =
        data?.embedUrl ||
        data?.embeUrl ||
        data?.watchUrl ||
        data?.link ||
        data?.url ||
        data?.streamUrl ||
        data?.videoUrl ||
        (typeof data === 'string' ? data : '');

      return {
        url: typeof videoUrl === 'string' ? videoUrl : '',
        raw: data,
        hasActiveStream:
          typeof videoUrl === 'string' && videoUrl.trim().length > 0,
      };
    } catch (error) {
      console.error('Error en getStream:', error);
      return { url: '', raw: null, hasActiveStream: false };
    }
  },

  getStreamCredentials: async () => {
    try {
      const res = await fetch(`${BASE_URL}/Stream`, {
        ...fetchOptions(true),  // requiere auth (admin)
        method: 'GET',
      });


      if (!res.ok) {
        return null;
      }

      const data = await res.json().catch(() => null);

      if (!data) return null;

      // Validación mínima: debe tener broadcastId (indicador de live real)
      if (!data.broadcastId && !data.streamingKey) {
        return null;
      }

      return {
        broadcastId: String(data.broadcastId ?? ''),
        watchUrl: String(data.watchUrl ?? ''),
        embeUrl: String(data.embeUrl ?? data.embedUrl ?? ''),
        rtmpServerUrl: String(data.rtmpServerUrl ?? ''),
        streamingKey: String(data.streamingKey ?? ''),
        estado: String(data.estado ?? ''),
      };
    } catch (error) {
      console.error('Error en getStreamCredentials:', error);
      return null;
    }
  },

  // 2. GET /api/Chat/history -> Historial público del chat.
  // No requiere autenticación. Las cookies de sesión se envían igualmente
  // mediante credentials: 'include'.
  getChatHistory: async (take = 50) => {
    const safeTake = Math.min(Math.max(take, 1), 100);

    try {
      const res = await fetch(`${BASE_URL}/api/Chat/history?take=${safeTake}`, {
        ...fetchOptions(false),
        method: 'GET',
      });

      // El historial es opcional para que el chat en tiempo real
      // siga funcionando aunque el endpoint histórico no esté publicado.
      if (res.status === 404) {
        return [];
      }

      if (!res.ok) {
        throw new Error(`Error en historial de chat (${res.status})`);
      }

      const data = await res.json();

      if (Array.isArray(data)) {
        return data as ChatHistoryMessage[];
      }

      if (Array.isArray(data?.messages)) {
        return data.messages as ChatHistoryMessage[];
      }

      return [];
    } catch (error) {
      console.error('Error en getChatHistory:', error);
      throw error;
    }
  },

  // 3. POST /SingIn
  // Registro de usuarios.
  registerUser: async (data: {
    Nombre: string;
    NombreUsuario: string;
    Apellido: string;
    Email: string;
    Password: string;
    PasswordConfir: string;
  }) => {

    const res = await fetch(`${BASE_URL}/SingIn`, {
      ...fetchOptions(false),
      method: 'POST',
      body: JSON.stringify(data),
    });

    const resData = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        resData?.message ||
        resData?.mensaje ||
        'No se pudo registrar el usuario.'
      );
    }

    return resData;
  },

  createStream: async (data: { titulo: string; descripcion: string }): Promise<StreamCredentials> => {
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

    // Normalizamos los campos por si el backend varía el casing
    return {
      broadcastId: String(resData.broadcastId ?? ''),
      watchUrl: String(resData.watchUrl ?? ''),
      embeUrl: String(resData.embeUrl ?? resData.embedUrl ?? ''),
      rtmpServerUrl: String(resData.rtmpServerUrl ?? ''),
      streamingKey: String(resData.streamingKey ?? ''),
      estado: String(resData.estado ?? ''),
    };
  },

  // Compatibilidad temporal: admin/index.tsx todavía utiliza postStream.
  postStream: async (data: { titulo: string; descripcion: string }) => {
    return api.createStream(data);
  },

  // 5. DELETE /api/Stream -> Finaliza y borra la transmisión activa.
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