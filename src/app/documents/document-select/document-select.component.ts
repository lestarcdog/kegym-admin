import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { documentTypesArray } from 'src/domain/document';

@Component({
  selector: 'app-document-select',
  templateUrl: './document-select.component.html',
  styleUrls: ['./document-select.component.scss']
})
export class DocumentSelectComponent {

  constructor() { }

  documentTypes = documentTypesArray

  @Input()
  selectControl: FormControl

  @Input()
  addEmptyElement = false

}
