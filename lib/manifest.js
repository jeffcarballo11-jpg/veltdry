(function () {
  "use strict";

  window.__BRAND__ = {
    name: "VELTDRY",
    tagline: "Turn conversations into customers.",
    taglineEs: "Convierte conversaciones en clientes.",

    whatsapp: {
      number: "50660345134",
      message: "Hola, quiero solicitar una demostración de VELTDRY.",
      get url() {
        return "https://wa.me/" + this.number + "?text=" + encodeURIComponent(this.message);
      }
    },

    demoScenarios: [
      {
        id: "producto",
        label: "Consulta de producto",
        messages: [
          { from: "user", text: "Hola, ¿tienen la camisa lino en talla M?" },
          { from: "ai", text: "¡Hola! Sí, tenemos la camisa de lino disponible en talla M, en color arena y azul noche. ¿Quieres que te muestre fotos de ambos colores?" },
          { from: "user", text: "Sí, el azul noche porfa" },
          { from: "ai", text: "Aquí tienes 📸 Cuesta ₡28.500 y hay envío gratis en compras mayores a ₡40.000. ¿Te la reservo?" }
        ]
      },
      {
        id: "precios",
        label: "Precios",
        messages: [
          { from: "user", text: "¿Cuánto cuesta el corte + barba?" },
          { from: "ai", text: "El combo corte + barba tiene un costo de ₡12.000 e incluye toalla caliente y diseño de línea. Dura aproximadamente 45 minutos." },
          { from: "user", text: "¿Tienen espacio hoy en la tarde?" },
          { from: "ai", text: "Tengo un espacio a las 3:40pm con el barbero Kevin. ¿Te lo agendo?" }
        ]
      },
      {
        id: "informacion",
        label: "Información",
        messages: [
          { from: "user", text: "¿Hasta qué hora abren los sábados?" },
          { from: "ai", text: "Los sábados abrimos de 9:00am a 6:00pm. Estamos ubicados en Plaza Real, local 14, frente al parking principal." },
          { from: "user", text: "¿Tienen parqueo?" },
          { from: "ai", text: "Sí, parqueo gratuito para clientes por 2 horas. ¿Necesitas algo más antes de tu visita?" }
        ]
      },
      {
        id: "compra",
        label: "Intención de compra",
        messages: [
          { from: "user", text: "Me interesa el plan mensual, ¿cómo pago?" },
          { from: "ai", text: "Puedes pagar directo aquí por SINPE Móvil o con tarjeta. Te envío el link de pago seguro ahora mismo." },
          { from: "user", text: "Perfecto, envíamelo" },
          { from: "ai", text: "Listo, aquí tienes tu link 🔗 En cuanto confirme el pago te activo el acceso al instante." }
        ]
      }
    ]
  };
})();
