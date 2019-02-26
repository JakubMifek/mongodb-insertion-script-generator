import {model, property} from '@loopback/repository';
import {ModelB} from '.';

@model()
export class ModelA extends ModelB {
  @property({
    type: 'string',
    required: true,
  })
  firstName: string;

  @property({
    type: 'string',
    required: true,
  })
  lastName: string;

  constructor(data?: Partial<ModelA>) {
    super(data);
  }
}
