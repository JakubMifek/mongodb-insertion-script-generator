import {model, property} from '@loopback/repository';
import {ZAssociation} from '.';

@model()
export class HeadPositionAssociation extends ZAssociation {
  constructor(data?: Partial<HeadPositionAssociation>) {
    super(data);
  }
}
