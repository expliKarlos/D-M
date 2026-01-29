export interface SpainGuideItem {
    id: string;
    title: string;
    image: string;
    description: string;
    meta?: { id: string; icon: string; label: string }[];
}

export interface SpainGuideCategory {
    id: string;
    title: string;
    items: SpainGuideItem[];
}

export const SPAIN_GUIDE_DATA: SpainGuideCategory[] = [
    {
        id: 'documentation',
        title: 'Documentación',
        items: [
            {
                id: 'visa',
                title: 'Tramita tu Visado Schengen',
                image: '/InfoSpain/Icono_Visado.png',
                description: 'Los ciudadanos de la India requieren un visado Schengen de corta duración para estancias de hasta 90 días. Tramítalo con al menos 15 días de antelación en los centros BLS.',
                meta: [{ id: 'time', icon: 'schedule', label: '15 días min.' }]
            },
            {
                id: 'passport',
                title: 'Revisa la Validez del Pasaporte',
                image: '/InfoSpain/Icono_Pasaporte.png',
                description: 'Tu pasaporte debe tener al menos dos páginas en blanco, haber sido emitido en los últimos 10 años y ser válido por 3 meses tras tu salida prevista de Europa.',
                meta: [{ id: 'validity', icon: 'verified_user', label: '3 meses extra' }]
            },
            {
                id: 'funds',
                title: 'Acredita Medios Económicos',
                image: '/InfoSpain/Icono_Dinero.png',
                description: 'Las autoridades pueden exigir prueba de solvencia; el mínimo actual es de aproximadamente 118,40 € por persona y día de estancia.',
                meta: [{ id: 'cost', icon: 'payments', label: '118,40€/día' }]
            }
        ]
    },
    {
        id: 'health',
        title: 'Salud',
        items: [
            {
                id: 'insurance',
                title: 'Seguro Médico Obligatorio',
                image: '/InfoSpain/Icono_SeguroMedico.png',
                description: 'Es obligatorio contar con un seguro médico con cobertura mínima de 30.000 € que incluya hospitalización de urgencia y repatriación en todo el espacio Schengen.',
                meta: [{ id: 'coverage', icon: 'health_and_safety', label: 'Min. 30k€' }]
            },
            {
                id: 'water',
                title: 'Agua del Grifo: ¡Bebe con Confianza!',
                image: '/InfoSpain/Icono_Agua.png',
                description: 'A diferencia de otros destinos, en Valladolid el agua del grifo es blanda y de excelente calidad, situándose entre las mejores de España.',
                meta: [{ id: 'quality', icon: 'water_drop', label: 'Excelente' }]
            },
            {
                id: 'sun',
                title: 'Protección frente al Sol de Castilla',
                image: '/InfoSpain/Icono_Sol.png',
                description: 'En junio y verano, el sol es muy intenso. Usa protección solar, sombrero y mantente hidratado para evitar golpes de calor.',
                meta: [{ id: 'alert', icon: 'wb_sunny', label: 'Sol intenso' }]
            },
            {
                id: 'emergency',
                title: 'Emergencias Sanitarias',
                image: '/InfoSpain/Icono_112.png',
                description: 'Ante cualquier emergencia vital, llama gratis al 112. El servicio de Emergencias Sanitarias de Castilla y León opera las 24 horas.',
                meta: [{ id: 'phone', icon: 'call', label: 'Llamar al 112' }]
            }
        ]
    },
    {
        id: 'transport',
        title: 'Transporte',
        items: [
            {
                id: 'flights',
                title: 'Vuelos Directos Delhi-Madrid',
                image: '/InfoSpain/Icono_Avion.png',
                description: 'Iberojet opera conexiones directas entre Nueva Delhi y Madrid, facilitando el acceso a la capital española desde la India.',
                meta: [{ id: 'route', icon: 'flight_takeoff', label: 'Delhi - Madrid' }]
            },
            {
                id: 'ave',
                title: 'Conecta con el AVE (Alta Velocidad)',
                image: '/InfoSpain/Icono_Tren.png',
                description: 'Desde la estación de Chamartín en Madrid, el tren AVE te llevará a Valladolid en solo 1 hora.',
                meta: [{ id: 'duration', icon: 'timer', label: '1 hora' }]
            },
            {
                id: 'valbuena_car',
                title: 'Traslado a Valbuena de Duero',
                image: '/InfoSpain/Icono_Coche.png',
                description: 'Valbuena se encuentra en el corazón de la Ribera del Duero. Se recomienda taxi o alquiler de coche desde Valladolid (aprox. 40-50 min) para llegar al evento.',
                meta: [{ id: 'duration', icon: 'directions_car', label: '45 mins' }]
            }
        ]
    },
    {
        id: 'culture',
        title: 'Cultura',
        items: [
            {
                id: 'kiss',
                title: 'El Saludo: Los Dos Besos',
                image: '/InfoSpain/Icono_Besos.png',
                description: 'Lo común es saludar con dos besos en las mejillas (empezando por la derecha) entre mujeres o entre hombres y mujeres. Entre hombres prima el apretón de manos.',
                meta: [{ id: 'tip', icon: 'face', label: '2 besos' }]
            },
            {
                id: 'meal_times',
                title: 'Horarios de Comida Tardíos',
                image: '/InfoSpain/Icono_RelojComida.png',
                description: 'Ten paciencia: el almuerzo suele ser a las 14:00 y la cena no empieza antes de las 21:00. Los restaurantes cierran cocina entre las 16:00 y las 20:30.',
                meta: [{ id: 'times', icon: 'schedule', label: 'Comida 14h / Cena 21h' }]
            },
            {
                id: 'siesta',
                title: 'Respeta la Siesta',
                image: '/InfoSpain/Icono_Siesta.png',
                description: 'Algunas tiendas pequeñas en Valladolid y Valbuena cierran de 14:00 a 17:00 para descansar o comer.',
                meta: [{ id: 'closed', icon: 'door_front', label: '14h - 17h' }]
            }
        ]
    },
    {
        id: 'money',
        title: 'Dinero',
        items: [
            {
                id: 'payments',
                title: 'Euro y Pagos Digitales',
                image: '/InfoSpain/Icono_Contactless.png',
                description: 'La moneda oficial es el Euro (€). Madrid y Valladolid están muy digitalizadas; usa tarjetas contactless para casi todo, pero lleva algo de efectivo para pequeños gastos.',
                meta: [{ id: 'method', icon: 'contactless', label: 'Contactless' }]
            },
            {
                id: 'taxfree',
                title: 'Tax Free (Ahorro de IVA)',
                image: '/InfoSpain/Icono_TaxFree.png',
                description: 'Como residente fuera de la UE, puedes solicitar el reembolso del IVA (generalmente 21%) en tus compras. Valida tus formularios DIVA en el aeropuerto antes de volver.',
                meta: [{ id: 'save', icon: 'savings', label: '21% IVA' }]
            },
            {
                id: 'tapas',
                title: 'El Arte del Tapeo (Pinchos)',
                image: '/InfoSpain/Icono_Tapa.png',
                description: 'Valladolid es famosa por sus "pinchos". No es obligatorio dejar propina, pero se aprecia redondear la cuenta o dejar un 5% si el servicio fue excelente.',
                meta: [{ id: 'food', icon: 'restaurant', label: 'D.O. Valladolid' }]
            }
        ]
    },
    {
        id: 'connectivity',
        title: 'Conectividad',
        items: [
            {
                id: 'esim',
                title: 'eSIM: Conexión Instantánea',
                image: '/InfoSpain/Icono_eSIM.png',
                description: 'La opción más cómoda es una eSIM (como Holafly o MicroEsim). Configúrala desde casa y tendrás datos ilimitados nada más aterrizar en Madrid.',
                meta: [{ id: 'tech', icon: 'router', label: 'eSIM Ready' }]
            },
            {
                id: 'security_net',
                title: 'Ciberseguridad en el Viaje',
                image: '/InfoSpain/Icono_VPN.png',
                description: 'Evita redes WiFi públicas para trámites bancarios. Es recomendable usar una VPN para proteger tus datos personales mientras te desplazas.',
                meta: [{ id: 'vpn', icon: 'vpn_lock', label: 'Usar VPN' }]
            }
        ]
    },
    {
        id: 'valbuena',
        title: 'Valbuena',
        items: [
            {
                id: 'wine',
                title: 'Tierra de Grandes Vinos',
                image: '/InfoSpain/Icono_Vino.png',
                description: 'Valbuena de Duero es hogar de bodegas prestigiosas como Vega Sicilia. Disfruta de los tintos de la D.O. Ribera del Duero, referentes internacionales.',
                meta: [{ id: 'origin', icon: 'wine_bar', label: 'D.O. Ribera' }]
            },
            {
                id: 'clothing',
                title: 'Vestimenta en Capas',
                image: '/InfoSpain/Icono_Chaqueta.png',
                description: '"Hasta el 40 de mayo, no te quites el sayo". Aunque los días sean cálidos, las noches en la meseta norte pueden ser frescas. Lleva siempre una chaqueta fina.',
                meta: [{ id: 'wear', icon: 'thermostat', label: 'Noches frescas' }]
            }
        ]
    },
    {
        id: 'security',
        title: 'Seguridad',
        items: [
            {
                id: 'pickpockets',
                title: 'Atención a los Carteristas',
                image: '/InfoSpain/Icono_Carterista.png',
                description: 'Los ladrones suelen actuar en lugares muy concurridos. Mantén siempre tu mochila o bolso cerrado y hacia adelante, nunca a la espalda.',
                meta: [{ id: 'alert', icon: 'security', label: 'Mochila delante' }]
            },
            {
                id: 'petitions',
                title: 'El Timo de las Firmas',
                image: '/InfoSpain/Icono_Firma.png',
                description: 'Desconfía de personas que te abordan en la calle pidiéndote firmar una supuesta "petición". A menudo es una táctica de distracción para robarte.',
                meta: [{ id: 'scam', icon: 'warning', label: 'No firmar' }]
            },
            {
                id: 'rosemary',
                title: 'La Ramita de Romero',
                image: '/InfoSpain/Icono_Romero.png',
                description: 'En zonas turísticas, pueden ofrecerte una ramita de romero para "leerte la suerte" y luego exigir dinero. Recházala con cortesía.',
                meta: [{ id: 'avoid', icon: 'block', label: 'No aceptar' }]
            }
        ]
    },
    {
        id: 'scams',
        title: 'Estafas',
        items: [
            {
                id: 'taxi_fixed',
                title: 'Taxis: Tarifa Fija',
                image: '/InfoSpain/Icono_TaxiAlerta.png',
                description: 'El traslado Aeropuerto Barajas - Madrid centro cuesta 33 € (fijo). Asegúrate de que el taxímetro funcione en otros trayectos.',
                meta: [{ id: 'rate', icon: 'local_taxi', label: '33€ Fijo Aerop.' }]
            },
            {
                id: 'menu_prices',
                title: 'Menús sin Precios',
                image: '/InfoSpain/Icono_Menu.png',
                description: 'Algunos restaurantes no incluyen precios en especiales del día. Pregunta siempre el precio antes de pedir.',
                meta: [{ id: 'ask', icon: 'restaurant_menu', label: 'Preguntar precio' }]
            },
            {
                id: 'fake_charity',
                title: 'Falsas ONGs',
                image: '/InfoSpain/Icono_ONG.png',
                description: 'Estafadores se hacen pasar por voluntarios de ONGs para pedir donaciones en efectivo. Colabora solo por canales oficiales.',
                meta: [{ id: 'warning', icon: 'verified', label: 'Canales oficiales' }]
            }
        ]
    }
];
