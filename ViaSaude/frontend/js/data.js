
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

// Agendamento de demonstração; este array não é o catálogo cartográfico.
window.viaSaudeUnits = [
  {
    id: 'upa-centro-norte',
    name: 'UPA Sobradinho',
    region: 'Sobradinho',
    district: 'Sobradinho II',
    type: 'UPA',
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
    name: 'Hospital Regional da Asa Norte (HRAN)',
    region: 'Plano Piloto',
    district: 'Asa Norte',
    type: 'Hospital',
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
    name: 'Hospital Regional de Taguatinga (HRT)',
    region: 'Taguatinga',
    district: 'Praça do Relógio',
    type: 'Hospital',
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
    name: 'Hospital Regional de Ceilândia (HRC)',
    region: 'Ceilândia',
    district: 'QNM 20',
    type: 'Hospital',
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