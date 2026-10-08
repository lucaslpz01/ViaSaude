// Dados fictícios para protótipo do Via Saúde.
// Trocar por dados reais quando houver integração ou base oficial.
window.viaSaudeData = {
  regions: [
    {
      id: 'plano-piloto',
      name: 'Plano Piloto',
      units: [
        {
          name: 'UPA Centro Norte',
          district: 'Centro Norte',
          distance: '1,2 km',
          queue: '18 min',
          status: 'verde',
          lotacao: 'Baixa',
          services: ['clínica-geral', 'vacina'],
          type: 'UPA'
        },
        {
          name: 'Hospital Regional de Saúde',
          district: 'Setor Comercial',
          distance: '2,4 km',
          queue: '31 min',
          status: 'amarelo',
          lotacao: 'Média',
          services: ['cardiologia', 'ginecologia'],
          type: 'Hospital'
        },
        {
          name: 'Centro de Atenção Básica Sul',
          district: 'Sul',
          distance: '3,0 km',
          queue: '12 min',
          status: 'verde',
          lotacao: 'Baixa',
          services: ['pediatria', 'clínica-geral'],
          type: 'UBS'
        }
      ]
    },
    {
      id: 'taguatinga',
      name: 'Taguatinga',
      units: [
        {
          name: 'UPA Taguatinga',
          district: 'QD 12',
          distance: '2,8 km',
          queue: '26 min',
          status: 'amarelo',
          lotacao: 'Média',
          services: ['clínica-geral', 'ultrassom'],
          type: 'UPA'
        },
        {
          name: 'Hospital Taguatinga',
          district: 'Praça do Relógio',
          distance: '4,1 km',
          queue: '42 min',
          status: 'vermelho',
          lotacao: 'Alta',
          services: ['cardiologia', 'ginecologia'],
          type: 'Hospital'
        },
        {
          name: 'Clínica Comunitária Norte',
          district: 'Shis QI 30',
          distance: '2,1 km',
          queue: '15 min',
          status: 'verde',
          lotacao: 'Baixa',
          services: ['pediatria', 'vacina'],
          type: 'UBS'
        }
      ]
    },
    {
      id: 'ceilandia',
      name: 'Ceilândia',
      units: [
        {
          name: 'UPA Ceilândia',
          district: 'Centro',
          distance: '3,4 km',
          queue: '21 min',
          status: 'verde',
          lotacao: 'Baixa',
          services: ['clínica-geral', 'vacina'],
          type: 'UPA'
        },
        {
          name: 'Hospital São José',
          district: 'QNM 20',
          distance: '5,6 km',
          queue: '35 min',
          status: 'amarelo',
          lotacao: 'Média',
          services: ['cardiologia', 'pediatria'],
          type: 'Hospital'
        }
      ]
    },
    {
      id: 'guas-lindas',
      name: 'Guaianases',
      units: [
        {
          name: 'Centro Médico Guaianases',
          district: 'Vila Nova',
          distance: '1,7 km',
          queue: '10 min',
          status: 'verde',
          lotacao: 'Baixa',
          services: ['clínica-geral', 'vacina'],
          type: 'UBS'
        },
        {
          name: 'UPA Guaianases',
          district: 'Centro',
          distance: '3,2 km',
          queue: '29 min',
          status: 'amarelo',
          lotacao: 'Média',
          services: ['ultrassom', 'ginecologia'],
          type: 'UPA'
        }
      ]
    }
  ],
  services: {
    'todos': 'Todos os serviços',
    'clínica-geral': 'Clínica geral',
    'pediatria': 'Pediatria',
    'cardiologia': 'Cardiologia',
    'ginecologia': 'Ginecologia',
    'ultrassom': 'Ultrassom',
    'vacina': 'Vacinação'
  }
};
