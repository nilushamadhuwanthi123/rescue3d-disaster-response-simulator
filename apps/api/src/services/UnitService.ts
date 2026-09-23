import type { CreateUnitRequest, ResponseUnit as ResponseUnitDto, UnitStatus } from '@rescue3d/contracts';
import { ResponseUnit, type ResponseUnitDocument } from '../models/ResponseUnit.js';
import { HttpError } from '../utils/ApiError.js';

function toDto(doc: ResponseUnitDocument): ResponseUnitDto {
  return {
    id: doc._id.toString(),
    name: doc.name,
    type: doc.type,
    status: doc.status,
    location: doc.location,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export async function createUnit(input: CreateUnitRequest): Promise<ResponseUnitDto> {
  const doc = await ResponseUnit.create(input);
  return toDto(doc);
}

export async function listUnits(filter: { status?: UnitStatus }): Promise<ResponseUnitDto[]> {
  const query = filter.status ? { status: filter.status } : {};
  const docs = await ResponseUnit.find(query).sort({ name: 1 });
  return docs.map(toDto);
}

export async function getUnit(id: string): Promise<ResponseUnitDocument> {
  const doc = await ResponseUnit.findById(id);
  if (!doc) {
    throw HttpError.notFound('Response unit not found.');
  }
  return doc;
}

export async function setUnitStatus(id: string, status: UnitStatus): Promise<ResponseUnitDto> {
  const doc = await getUnit(id);
  doc.status = status;
  await doc.save();
  return toDto(doc);
}

export { toDto as unitToDto };
