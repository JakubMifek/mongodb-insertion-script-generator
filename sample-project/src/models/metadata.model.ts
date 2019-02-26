import {Model, model, property} from '@loopback/repository';

@model()
export class Metadata extends Model {
  @property({
    type: 'string',
    required: true,
  })
  type: string;

  @property({
    type: 'string',
    required: true,
  })
  created: string;

  @property({
    type: 'string',
    required: true,
  })
  modified: string;

  constructor(data?: Partial<Metadata>) {
    super(data);
  }
}
