import { ErrorObject } from 'ajv/dist/types';
import { table } from './table';
import { ReportFormat, ReportObject } from '../interfaces';

export class Reporter {
  format: ReportFormat;

  constructor(format: ReportFormat = 'table') {
    this.format = format;
  }

  dump(raw: ErrorObject[]): void {
    const errors = this.formatErrors(raw);
    console.log(this.build(errors));
  }

  private build(obj: ReportObject[]): string {
    switch (this.format) {
      case 'json':
        return this.json(obj, '\t');
      case 'table':
        return table(obj);
    }
  }

  private json(obj: ReportObject[], space?: string): string {
    return JSON.stringify(obj, null, space);
  }

  private formatErrors(rawErrors: ErrorObject[]): ReportObject[] {
    const newErrorObj: ReportObject[] = [];
    rawErrors.forEach((err) =>
      newErrorObj.push({
        propertyPath: err.instancePath,
        parameter: err.params,
        message: err.message as string
      })
    );
    return newErrorObj;
  }
}
