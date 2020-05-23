import { Component, OnInit } from '@angular/core';
import { Chart } from 'angular-highcharts';

@Component({
  selector: 'app-training-chart',
  templateUrl: './training-chart.component.html',
  styleUrls: ['./training-chart.component.scss']
})
export class TrainingChartComponent implements OnInit {

  chart: Chart

  constructor() { }

  ngOnInit(): void {
  }

}
