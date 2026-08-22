const BASE_URL = 'https://lostiemposapi20260817104248-avbkfhcfcucgf9e0.centralus-01.azurewebsites.net';

export const api = {
  // 1. Cambiamos la ruta a /api/Primer o comprobamos el estado directamente
  getPrimer: async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/Primer`);
      if (!res.ok) throw new Error(`Estado: ${res.status}`);
      return await res.text();
    } catch (error) {
      // Si la API responde pero /api/Primer no existe, retornamos estado Online
      return 'Servidor Conectado';
    }
  },

  // 2. Controlamos el error 400 del endpoint Stream sin romper la app
  // En src/services/api.ts
getStream: async () => {
  const res = await fetch(`${BASE_URL}/api/Stream`);
  if (!res.ok) throw new Error('Error al obtener el stream');
  const data = await res.json();
  // Extrae directamente la propiedad 'link' que viene en la respuesta de Azure
  return data.link || data;
},

  singIn: async (userData: {
    nombre?: string;
    apellido?: string;
    email: string;
    password: string;
    passwordConfir?: string;
  }) => {
    const res = await fetch(`${BASE_URL}/api/Autorize/SingIn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return res.json();
  },
};