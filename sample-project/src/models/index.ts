export * from './metadata.model';
export * from './z-association.model';
export * from './head-position-association.model';
export * from './model-b.model';
export * from './model-a.model';
export * from './model-c.model';

import { Metadata } from './metadata.model';
import { ZAssociation } from './z-association.model';
import { HeadPositionAssociation } from './head-position-association.model';
import { ModelA } from './model-a.model';
import { ModelB } from './model-b.model';
import { ModelC } from './model-c.model';

import { Entity } from '@loopback/repository';

export const datatables: { [index:string]: string } = {
    ModelA: 'ModelBs',
    ModelC: 'ModelCs'
};

export const types: { [index:string]: Function } = {
    Metadata: Metadata,
    ZAssociation: ZAssociation,
    HeadPositionAssociation: HeadPositionAssociation,
    ModelA: ModelA,
    ModelB: ModelB,
    ModelC: ModelC
}

function createMetadata(name: string): Metadata {
    return new Metadata({
        type: name,
        created: new Date().toISOString(),
        modified: new Date().toISOString()
    });
}

function createAssociation(): HeadPositionAssociation {
    return new HeadPositionAssociation({
        _id: 'guidA',
        metadata: createMetadata(HeadPositionAssociation.name),
        modelBId: 'guid1',
        modelBInvolvedId: 'guid2'
    });
}

export const factory: { [index:string]: () => Entity } = {
    HeadPositionAssociation: createAssociation,
    ModelA: () => new ModelA({
                _id: 'guid1',
                metadata: createMetadata(ModelA.name),
                firstName: 'Spongebob',
                lastName: 'Squarepants',
                associations: [createAssociation(), createAssociation()]
            }),
    ModelC: () => new ModelC({
                _id: 'guid2',
                metadata: createMetadata(ModelC.name),
                modelBIds: ['guid1', 'guid2']
            })
}

