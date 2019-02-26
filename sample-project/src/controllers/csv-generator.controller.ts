import * as Models from '../models';
import { post } from '@loopback/rest';
import { ModelDefinition, ModelMetadataHelper as Helper } from '@loopback/repository';
import { json2csvAsync } from 'json-2-csv';
import { writeFile } from 'fs';

export class CsvGeneratorController {
    constructor() { }

    @post('/generate-csv-from-models', {
        responses: { }
    })
    async generateCsvFromModels() {
        console.log('Generating CSV from models...');
        for(const model in Models.factory) {
            console.log(`Currently proccessed model: ${model}`);
            if(Models.types[model] === undefined) { // Mistake in index.ts
                console.log('Model type is undefined, please fix your /src/models/index.ts file.');
                continue;
            }

            // metadata of current model
            const metadata: ModelDefinition | {} = Helper.getModelMetadata(Models.types[model]);

            if(metadata == {})
                continue;

            // model's properties
            const properties = (metadata as ModelDefinition).properties;
            console.log(JSON.stringify(properties, null, 2));

            const propertiesToExclude = [];
            for(const property in properties) {
                console.log(`Property: ${property}\n${properties[property]['type']}\n${properties[property]['items']}`);
                if(properties[property]['type'] === 'array' && properties[property]['items'] === 'object') {
                    propertiesToExclude.push(property);
                }
            }

            // default values
            const defaultValue = Models.factory[model]();
            for(const property of propertiesToExclude) {
                console.log(`Exluding property ${property}`);
                this.generateSubmodelFromArray(model, property, defaultValue);
            }
            console.log(`Default: ${JSON.stringify(defaultValue)}`);

            const csv: string = await json2csvAsync([defaultValue], {
                emptyFieldValue: '',
                excelBOM: false,
                expandArrayObjects: true
            });

            await this.writeFile(`csvs/${model}.csv`, csv);
        }
        await this.writeFile(`csvs/datatables.json`, JSON.stringify(Models.datatables, null, 2));
        console.log('CSVs generated.');
    }

    generateSubmodelFromArray(modelName: string, property: string, model: any): void {
        if(!model[property])
            return;

        console.log(`Property to exclude: ${property}`);
        const values: { _id: string }[] = model[property];
        delete model[property];
        model[`${property}.merged`] = values.map(prop => prop._id);
        console.log('Property excluded.');
    }

    writeFile(filename: string, data: string): Promise<string> {
        return new Promise((resolve, reject) => {
            writeFile(filename, data, err => { if(err) reject(err); resolve('File created successfully'); });
        });
    }
}
