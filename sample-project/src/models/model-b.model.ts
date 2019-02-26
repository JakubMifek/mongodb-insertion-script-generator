import {Entity, model, property} from '@loopback/repository';
import {Metadata, ZAssociation} from '.';

@model()
export class ModelB extends Entity {
  @property({
    type: 'string',
    id: true,
    required: true
  })
  _id: string;

  @property({
    type: 'object',
    required: true
  })
  metadata: Metadata;

  @property({
    type: 'array',
    items: 'object',
    rqeuired: false
  })
  associations: ZAssociation[]

  constructor(data?: Partial<ModelB>) {
    super(data);
  }
}
