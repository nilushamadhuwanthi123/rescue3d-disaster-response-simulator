import type { CityConfig, CityLocation, CityRoadEdge, CityRoadNode } from './scene.js';

export const DEFAULT_ROAD_NODES: CityRoadNode[] = [
  { id: 'node-nw', position: { x: -40, y: 0, z: -30 } },
  { id: 'node-nc', position: { x: 0, y: 0, z: -30 } },
  { id: 'node-ne', position: { x: 40, y: 0, z: -30 } },
  { id: 'node-mw', position: { x: -40, y: 0, z: 0 } },
  { id: 'node-cw', position: { x: -20, y: 0, z: 0 } },
  { id: 'node-c', position: { x: 0, y: 0, z: 0 } },
  { id: 'node-ce', position: { x: 20, y: 0, z: 0 } },
  { id: 'node-me', position: { x: 40, y: 0, z: 0 } },
  { id: 'node-sw', position: { x: -40, y: 0, z: 30 } },
  { id: 'node-sc', position: { x: 0, y: 0, z: 30 } },
  { id: 'node-se', position: { x: 40, y: 0, z: 30 } },
  { id: 'node-south-hq', position: { x: 0, y: 0, z: 45 } },
];

export const DEFAULT_ROAD_EDGES: CityRoadEdge[] = [
  { id: 'road-nw-nc', fromNodeId: 'node-nw', toNodeId: 'node-nc' },
  { id: 'road-nc-ne', fromNodeId: 'node-nc', toNodeId: 'node-ne' },
  { id: 'road-mw-cw', fromNodeId: 'node-mw', toNodeId: 'node-cw' },
  { id: 'road-cw-c', fromNodeId: 'node-cw', toNodeId: 'node-c' },
  { id: 'road-c-ce', fromNodeId: 'node-c', toNodeId: 'node-ce' },
  { id: 'road-ce-me', fromNodeId: 'node-ce', toNodeId: 'node-me' },
  { id: 'road-sw-sc', fromNodeId: 'node-sw', toNodeId: 'node-sc' },
  { id: 'road-sc-se', fromNodeId: 'node-sc', toNodeId: 'node-se' },
  { id: 'road-sc-south-hq', fromNodeId: 'node-sc', toNodeId: 'node-south-hq' },

  { id: 'road-nw-mw', fromNodeId: 'node-nw', toNodeId: 'node-mw' },
  { id: 'road-mw-sw', fromNodeId: 'node-mw', toNodeId: 'node-sw' },
  { id: 'road-nc-c', fromNodeId: 'node-nc', toNodeId: 'node-c' },
  { id: 'road-c-sc', fromNodeId: 'node-c', toNodeId: 'node-sc' },
  { id: 'road-ne-me', fromNodeId: 'node-ne', toNodeId: 'node-me' },
  { id: 'road-me-se', fromNodeId: 'node-me', toNodeId: 'node-se' },
];

export const DEFAULT_CITY_LOCATIONS: CityLocation[] = [
  {
    locationId: 'facility-hospital',
    type: 'hospital',
    displayName: 'St. Jude Central Hospital',
    scenePosition: { x: -40, y: 0, z: -30 },
    roadNodeId: 'node-nw',
  },
  {
    locationId: 'facility-fire-station',
    type: 'fire_station',
    displayName: 'Station 7 Fire & Rescue',
    scenePosition: { x: 40, y: 0, z: -30 },
    roadNodeId: 'node-ne',
  },
  {
    locationId: 'facility-rescue-station',
    type: 'rescue_station',
    displayName: 'Metro Disaster Response HQ',
    scenePosition: { x: 0, y: 0, z: 45 },
    roadNodeId: 'node-south-hq',
  },
  {
    locationId: 'bldg-metro-tower',
    type: 'commercial',
    displayName: 'Metro Financial Tower',
    scenePosition: { x: -20, y: 0, z: 0 },
    roadNodeId: 'node-cw',
  },
  {
    locationId: 'bldg-civic-center',
    type: 'commercial',
    displayName: 'City Civic Auditorium',
    scenePosition: { x: 20, y: 0, z: 0 },
    roadNodeId: 'node-ce',
  },
  {
    locationId: 'bldg-harbor-warehouse',
    type: 'industrial',
    displayName: 'Harbor Logistics Warehouse',
    scenePosition: { x: -40, y: 0, z: 30 },
    roadNodeId: 'node-sw',
  },
  {
    locationId: 'bldg-grand-hotel',
    type: 'residential',
    displayName: 'Grand Plaza Hotel & Suites',
    scenePosition: { x: 40, y: 0, z: 30 },
    roadNodeId: 'node-se',
  },
  {
    locationId: 'bldg-tech-campus',
    type: 'commercial',
    displayName: 'Silicon Bay Tech Campus',
    scenePosition: { x: 0, y: 0, z: -30 },
    roadNodeId: 'node-nc',
  },
];

export const RESCUE3D_CITY_CONFIG: CityConfig = {
  name: 'Rescue3D Metro Simulation City',
  bounds: {
    minX: -55,
    maxX: 55,
    minZ: -45,
    maxZ: 55,
  },
  locations: DEFAULT_CITY_LOCATIONS,
  roadNodes: DEFAULT_ROAD_NODES,
  roadEdges: DEFAULT_ROAD_EDGES,
};
