import { WorkerModel, IWorker } from '../models/Worker.js';
import { IncidentModel, IIncident } from '../models/Incident.js';
import { testSupabaseConnection } from '../config/supabase.js';

const SAMPLE_WORKERS: Partial<IWorker>[] = [
  {
    workerId: 'MINER-4091',
    name: 'Rajesh Kumar',
    role: 'Deep Shaft Operator',
    zone: 'Tunnel-A04',
    bloodGroup: 'O+',
    emergencyContact: '+91 98450 12890',
    shiftStartTimestamp: new Date(Date.now() - 4.5 * 3600000),
    maxShiftMinutes: 480,
    photoUrl: '/assets/miners/rajesh.jpg',
    activeUnderground: true,
    ppeCompliance: {
      helmet: true,
      safetyJacket: true,
      respiratorMask: true,
      steelBoots: true,
      gloves: true,
    },
  },
  {
    workerId: 'MINER-8422',
    name: 'Devendra Singh',
    role: 'Excavation Drill Master',
    zone: 'Gas-Zone-B12',
    bloodGroup: 'B+',
    emergencyContact: '+91 98231 44520',
    shiftStartTimestamp: new Date(Date.now() - 3.2 * 3600000),
    maxShiftMinutes: 480,
    photoUrl: '/assets/miners/devendra.jpg',
    activeUnderground: true,
    ppeCompliance: {
      helmet: false,
      safetyJacket: true,
      respiratorMask: false,
      steelBoots: true,
      gloves: false,
    },
  },
  {
    workerId: 'MINER-1290',
    name: 'Amitabh Sharma',
    role: 'Ventilation Tech',
    zone: 'Shaft-01',
    bloodGroup: 'A+',
    emergencyContact: '+91 94120 77310',
    shiftStartTimestamp: new Date(Date.now() - 6.8 * 3600000),
    maxShiftMinutes: 480,
    photoUrl: '/assets/miners/rajesh.jpg',
    activeUnderground: true,
    ppeCompliance: {
      helmet: true,
      safetyJacket: true,
      respiratorMask: true,
      steelBoots: true,
      gloves: true,
    },
  },
  {
    workerId: 'MINER-6743',
    name: 'Sunil Mondal',
    role: 'Conveyor Loader',
    zone: 'Conveyor-C02',
    bloodGroup: 'AB+',
    emergencyContact: '+91 91560 99401',
    shiftStartTimestamp: new Date(Date.now() - 5.1 * 3600000),
    maxShiftMinutes: 480,
    photoUrl: '/assets/miners/devendra.jpg',
    activeUnderground: true,
    ppeCompliance: {
      helmet: false,
      safetyJacket: true,
      respiratorMask: false,
      steelBoots: true,
      gloves: false,
    },
  },
  {
    workerId: 'MINER-5519',
    name: 'Prakash Soren',
    role: 'Longwall Specialist',
    zone: 'Excavation-Face',
    bloodGroup: 'O-',
    emergencyContact: '+91 97312 88204',
    shiftStartTimestamp: new Date(Date.now() - 2.0 * 3600000),
    maxShiftMinutes: 480,
    photoUrl: '/assets/miners/rajesh.jpg',
    activeUnderground: true,
    ppeCompliance: {
      helmet: true,
      safetyJacket: true,
      respiratorMask: true,
      steelBoots: true,
      gloves: true,
    },
  },
];

const SAMPLE_INCIDENTS: Partial<IIncident>[] = [
  {
    incidentId: 'ALT-1092',
    title: 'Elevated Methane Spike',
    description: 'CH4 sensor at Gas-Zone-B12 exceeded nominal limit (1.15% vol).',
    severity: 'WARNING',
    zone: 'Gas-Zone-B12',
    timestamp: new Date(Date.now() - 120000),
    acknowledged: false,
    category: 'GAS_LEAK',
    regulatoryClause: 'DGMS Reg. 153(2)',
    mitigationStep: 'Spin up auxiliary exhaust fan & monitor trend.',
  },
  {
    incidentId: 'ALT-1091',
    title: 'Missing PPE Equipment',
    description: 'Miner Devendra Singh entered Tunnel-A04 without certified Respirator Mask.',
    severity: 'CRITICAL',
    zone: 'Tunnel-A04',
    timestamp: new Date(Date.now() - 340000),
    acknowledged: true,
    category: 'PPE_VIOLATION',
    regulatoryClause: 'OSHA 1926.95 / DGMS PPE Std',
    mitigationStep: 'Safety marshal dispatched to Entry Airway #2.',
  },
];

export const seedDatabase = async () => {
  try {
    console.log('🌱 [CoalGuard Seed] Connecting to Supabase / Database...');
    await testSupabaseConnection();

    console.log('[CoalGuard Seed] Clearing old worker and incident records...');
    await WorkerModel.deleteMany();
    await IncidentModel.deleteMany();

    console.log('[CoalGuard Seed] Inserting sample miners roster...');
    await WorkerModel.insertMany(SAMPLE_WORKERS);

    console.log('[CoalGuard Seed] Inserting initial incident logs...');
    await IncidentModel.insertMany(SAMPLE_INCIDENTS);

    console.log('✅ [CoalGuard Seed] Database seeded successfully into Supabase!');
    process.exit(0);
  } catch (error) {
    console.error('❌ [CoalGuard Seed Error]', error);
    process.exit(1);
  }
};

if (process.argv[1] && process.argv[1].includes('seedDatabase')) {
  seedDatabase();
}
