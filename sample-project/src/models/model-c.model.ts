import {Entity, model, property} from '@loopback/repository';
import {Metadata} from '.';

@model()
export class ModelC extends Entity {
  @property({
    type: 'string',
    id: true,
    required: true,
  })
  _id: string;

  @property({
    type: 'object',
    required: true
  })
  metadata: Metadata;

  @property({
    type: 'array',
    itemType: 'string',
  })
  modelBIds?: string[];

  constructor(data?: Partial<ModelC>) {
    super(data);
  }
}
