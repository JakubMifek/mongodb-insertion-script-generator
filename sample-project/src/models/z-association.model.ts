import {Entity, model, property} from '@loopback/repository';

@model()
export class ZAssociation extends Entity {
  @property({
    type: 'string',
    id: true,
    required: true,
  })
  _id: string;

  @property({
    type: 'object',
    required: true,
  })
  metadata: object;

  @property({
    type: 'string',
    required: true,
  })
  modelBId: string;

  @property({
    type: 'string',
    required: true,
  })
  modelBInvolvedId: string;

  constructor(data?: Partial<ZAssociation>) {
    super(data);
  }
}
