
window.viaSaudeConfig = {
  demoMode: true,          // true = exibe aviso de "dados de demonstração" no site e no chat
  emergencyPhone: '192',   // SAMU
  saluvaEndpoint: '',      // ex.: '/api/saluva' (veja server.js). Vazio = Saluva responde só com regras locais
};

window.viaSaudeServices = {
  'consulta-geral': 'Clínica geral',
  pediatria: 'Pediatria',
  cardiologia: 'Cardiologia',
  ginecologia: 'Ginecologia',
  ultrassom: 'Ultrassom',
  vacina: 'Vacinação'
};

window.viaSaudeUnits = [
  {
    id: 'upa-centro-norte',
    name: 'UPA Centro Norte',
    region: 'Plano Piloto',
    district: 'Centro Norte',
    type: 'UPA',
    distance: 1.2,
    queueMinutes: 18,
    status: 'verde',
    address: 'Av. Central, 224, Centro Norte, Brasília',
    phone: '(61) 3234-1200',
    services: ['consulta-geral', 'vacina'],
    doctorsByService: {
      'consulta-geral': ['Dra. Ana Souza', 'Dr. Ricardo Costa', 'Enf. Camila Nunes'],
      vacina: ['Enf. Luiza Melo', 'Enf. Pedro Vilar']
    },
    availableTimes: {
      'consulta-geral': ['08:30', '09:15', '11:00', '14:30'],
      vacina: ['08:00', '10:00', '15:00']
    }
  },
  {
    id: 'hospital-regional',
    name: 'Hospital Regional de Saúde',
    region: 'Plano Piloto',
    district: 'Setor Comercial',
    type: 'Hospital',
    distance: 2.4,
    queueMinutes: 31,
    status: 'amarelo',
    address: 'Quadra 7, Setor Comercial, Brasília',
    phone: '(61) 3354-2200',
    services: ['cardiologia', 'ginecologia'],
    doctorsByService: {
      cardiologia: ['Dr. César Nogueira', 'Dra. Mila Faria'],
      ginecologia: ['Dra. Victorina Silva', 'Dra. Letícia Prado']
    },
    availableTimes: {
      cardiologia: ['08:00', '09:45', '13:00'],
      ginecologia: ['07:50', '11:15', '15:45']
    }
  },
  {
    id: 'centro-atencao-sul',
    name: 'Centro de Atenção Básica Sul',
    region: 'Plano Piloto',
    district: 'Sul',
    type: 'UBS',
    distance: 3.1,
    queueMinutes: 12,
    status: 'verde',
    address: 'Rua das Águas, 40, Sul, Brasília',
    phone: '(61) 3440-9000',
    services: ['pediatria', 'consulta-geral'],
    doctorsByService: {
      pediatria: ['Dra. Gabriela Costa', 'Dr. Vinicius Lemos'],
      'consulta-geral': ['Dra. Beatriz Ferraro', 'Dr. João Neri']
    },
    availableTimes: {
      pediatria: ['08:15', '09:30', '14:00'],
      'consulta-geral': ['07:30', '10:45', '16:00']
    }
  },
  {
    id: 'upa-taguatinga',
    name: 'UPA Taguatinga',
    region: 'Taguatinga',
    district: 'QD 12',
    type: 'UPA',
    distance: 2.8,
    queueMinutes: 26,
    status: 'amarelo',
    address: 'QD 12, lotes 5-8, Taguatinga',
    phone: '(61) 3117-5600',
    services: ['consulta-geral', 'ultrassom'],
    doctorsByService: {
      'consulta-geral': ['Dra. Sofia Andrade', 'Dr. Tadeu Ramos'],
      ultrassom: ['Dra. Marina Dantas', 'Dr. Eduardo Júnior']
    },
    availableTimes: {
      'consulta-geral': ['08:20', '10:30', '15:15'],
      ultrassom: ['09:00', '12:40', '17:00']
    }
  },
  {
    id: 'hospital-taguatinga',
    name: 'Hospital Taguatinga',
    region: 'Taguatinga',
    district: 'Praça do Relógio',
    type: 'Hospital',
    distance: 4.1,
    queueMinutes: 42,
    status: 'vermelho',
    address: 'Praça do Relógio, Taguatinga, Brasília',
    phone: '(61) 3301-4545',
    services: ['cardiologia', 'ginecologia'],
    doctorsByService: {
      cardiologia: ['Dr. Joaquim Vale', 'Dra. Renata Figueiredo'],
      ginecologia: ['Dra. Juliana Azevedo', 'Dra. Carla Mendes']
    },
    availableTimes: {
      cardiologia: ['08:40', '13:20'],
      ginecologia: ['09:10', '11:30', '16:10']
    }
  },
  {
    id: 'clinica-comunitaria-norte',
    name: 'Clínica Comunitária Norte',
    region: 'Taguatinga',
    district: 'SHIS QI 30',
    type: 'UBS',
    distance: 2.1,
    queueMinutes: 15,
    status: 'verde',
    address: 'SHIS QI 30, Taguatinga',
    phone: '(61) 3102-8800',
    services: ['pediatria', 'vacina'],
    doctorsByService: {
      pediatria: ['Dra. Elisa Bittencourt', 'Dr. Alexandre Costa'],
      vacina: ['Enf. Fernanda Costa', 'Enf. Ivo Martins']
    },
    availableTimes: {
      pediatria: ['08:45', '10:15', '15:30'],
      vacina: ['07:30', '11:00', '16:30']
    }
  },
  {
    id: 'upa-ceilandia',
    name: 'UPA Ceilândia',
    region: 'Ceilândia',
    district: 'Centro',
    type: 'UPA',
    distance: 3.4,
    queueMinutes: 21,
    status: 'verde',
    address: 'Centro de Ceilândia, Brasília',
    phone: '(61) 3196-7800',
    services: ['consulta-geral', 'vacina'],
    doctorsByService: {
      'consulta-geral': ['Dr. Paulo Viegas', 'Dra. Aline Duarte'],
      vacina: ['Enf. Marcia Torres', 'Enf. Rafael Nunes']
    },
    availableTimes: {
      'consulta-geral': ['07:40', '09:00', '14:10'],
      vacina: ['08:00', '12:30', '16:00']
    }
  },
  {
    id: 'hospital-sao-jose',
    name: 'Hospital São José',
    region: 'Ceilândia',
    district: 'QNM 20',
    type: 'Hospital',
    distance: 5.6,
    queueMinutes: 35,
    status: 'amarelo',
    address: 'QNM 20, bloco B, Ceilândia',
    phone: '(61) 3340-1000',
    services: ['cardiologia', 'pediatria'],
    doctorsByService: {
      cardiologia: ['Dr. Renan Dourado', 'Dra. Joana Bragança'],
      pediatria: ['Dra. Helena Costa', 'Dr. Tiago Farias']
    },
    availableTimes: {
      cardiologia: ['08:30', '11:45', '15:00'],
      pediatria: ['09:15', '13:30', '17:10']
    }
  },
  {
    id: 'ubs-gama',
    name: 'Centro de Saúde do Gama',
    region: 'Gama',
    district: 'Setor Central',
    type: 'UBS',
    distance: 1.7,
    queueMinutes: 10,
    status: 'verde',
    address: 'Setor Central, Gama, Brasília',
    phone: '(61) 3185-4411',
    services: ['consulta-geral', 'vacina'],
    doctorsByService: {
      'consulta-geral': ['Dra. Nádia Brito', 'Dr. Otto Lins'],
      vacina: ['Enf. Patrícia Souza', 'Enf. Carlos Reis']
    },
    availableTimes: {
      'consulta-geral': ['07:20', '10:50', '15:40'],
      vacina: ['08:10', '11:20', '16:15']
    }
  },
  {
    id: 'upa-gama',
    name: 'UPA Gama',
    region: 'Gama',
    district: 'Setor Sul',
    type: 'UPA',
    distance: 3.2,
    queueMinutes: 29,
    status: 'amarelo',
    address: 'Setor Sul, Gama, Brasília',
    phone: '(61) 3366-7070',
    services: ['ultrassom', 'ginecologia'],
    doctorsByService: {
      ultrassom: ['Dra. Cíntia Marchi', 'Dr. Iago Pires'],
      ginecologia: ['Dra. Yara Fernandes', 'Dra. Rebeca Mota']
    },
    availableTimes: {
      ultrassom: ['08:15', '12:00', '17:05'],
      ginecologia: ['09:45', '13:10', '15:35']
    }
  }
];