// mercadopago-checkout.js
import 'dotenv/config';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Criar a configuração com o accessToken vindo do arquivo .env
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

// Função para criar a preferência
export const createPreference = async (title, price, quantity) => {
  const preference = new Preference(client);

  try {
    const response = await preference.create({
      body: {
        items: [
          {
            title: title,
            quantity: quantity,
            unit_price: price,
          },
        ],
        back_urls: {
          success: "https://www.brotherscup.com.br/successo",
          failure: "http://www.brotherscup.com.br/falhou",
          pending: "http://www.brotherscup.com.br/pendente",
        },
        auto_return: "approved",
        notification_url: `${process.env.BACKEND_URL}/mercadopago/webhook`,
      },
    });

    return response.body.id; // Retorna o ID da preferência
  } catch (error) {
    console.error("Erro ao criar preferência:", error);
    throw new Error('Erro ao criar preferência');
  }
};
