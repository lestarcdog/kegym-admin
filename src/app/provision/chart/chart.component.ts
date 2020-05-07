import { Component, Input, OnInit } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { SeriesOptionsType } from 'highcharts';
import { FoodEntryItem } from '../provision.component';

const DOG_WEIGHT = 'Kutya súlya'
const FOOD = 'Étel adag'

const COLOR_BANDS = ['#D8E2DC', '#FFE5D9', '#FFCAD4', '#F4ACB7']


@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit {

  @Input()
  set foods(entries: FoodEntryItem[]) {
    if (entries && entries.length) {
      const rev = [...entries].reverse()
      console.log('Entries', rev)
      const foodSeries: SeriesOptionsType = {
        name: FOOD,
        type: 'line',
        yAxis: 1,
        tooltip: {
          valueSuffix: 'g',
        },
        data: rev.map(f => ({
          x: f.date.getTime(),
          y: f.foodPortion,
          name: `Étel: ${f.foodName}`
        }))
      }

      const dogWeightSeries: SeriesOptionsType = {
        name: DOG_WEIGHT,
        type: 'line',
        yAxis: 0,
        tooltip: {
          valueSuffix: 'kg'
        },
        data: rev.map(f => ({
          x: f.date.getTime(),
          y: f.dogWeight,
          name: `Étel: ${f.foodName}`
        }))
      }

      this.chart.removeSeries(0)
      this.chart.removeSeries(0)

      this.chart.addSeries(foodSeries, true, true)
      this.chart.addSeries(dogWeightSeries, true, true)

      this.chart.ref$.subscribe(ref => {
        const axis = ref.xAxis[0]
        rev.forEach(e => axis.removePlotBand(e.foodName))

        for (let i = 0; i < rev.length - 1; i++) {
          const curr = rev[i]
          const next = rev[i + 1]

          axis.addPlotBand({
            from: curr.date.getTime(),
            to: next.date.getTime(),
            id: curr.foodName,
            zIndex: -1,
            color: COLOR_BANDS[i % COLOR_BANDS.length],
            label: {
              text: `Étel: ${curr.foodName}`,
              align: 'center'
            }
          })
        }
      })
    }
  }

  @Input()
  set hasFocus(focus: boolean) {
    if (focus) {
      // there is some drawing issue with the sidenav and highcharts and the graph is cut off
      setTimeout(() => this.chart.ref$.subscribe(r => r.reflow()), 100)
    }
  }

  chart: Chart

  ngOnInit(): void {
    this.chart = new Chart({
      chart: {
        type: 'line',
        backgroundColor: '#dfffdf',
        zoomType: 'x'
      },
      title: {
        text: 'Etetési napló'
      },
      credits: {
        enabled: false
      },
      xAxis: {
        type: 'datetime',
        dateTimeLabelFormats: {
          day: '%Y %b %e',
          week: '%Y %b %e'
        },
      },
      yAxis: [
        {
          type: 'linear',
          title: { text: DOG_WEIGHT },
          labels: { formatter() { return `${this.value}kg` } },
        },
        {
          type: 'linear',
          title: { text: FOOD },
          labels: { formatter() { return `${this.value}g` } },
          opposite: true
        }
      ]
    });
  }

}
