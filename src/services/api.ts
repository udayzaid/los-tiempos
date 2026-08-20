const BASE_URL = 'https://lostiemposapi20260817104248-avbkfhcfcucgf9e0.centralus-01.azurewebsites.net';

export const api = {
  getPrimer: async () => {
    const res = await fetch(`${BASE_URL}/`);
    if (!res.ok) throw new Error('Error al conectar con el servidor');
    return res.text();
  },
  // Endpoint de Registro / Iniciar Sesión de tu API
  singIn: async (userData: {
    nombre?: string;
    apellido?: string;
    email: string;
    password: string;
    passwordConfir?: string;
  }) => {
    const res = await fetch(`${BASE_URL}/api/Autorize/SingIn`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Error en la petición a la API');
    }

    return data;
  },
};