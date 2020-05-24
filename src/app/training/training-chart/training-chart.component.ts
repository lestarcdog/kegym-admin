import { Component, Input, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Chart } from 'angular-highcharts';
import { PointOptionsObject, SeriesLineOptions } from 'highcharts';
import { TrainingEntryItem } from '../training.component';

@Component({
  selector: 'app-training-chart',
  templateUrl: './training-chart.component.html',
  styleUrls: ['./training-chart.component.scss']
})
export class TrainingChartComponent implements OnInit {

  chart: Chart

  private seriesCount = 0

  private allEntries: TrainingEntryItem[] = []

  showAllSeries = true

  @Input()
  set entries(items: TrainingEntryItem[]) {
    this.allEntries = [...items]
    this.drawGraph()
  }

  ngOnInit(): void {
    this.chart = new Chart({
      chart: {
        type: 'line',
        backgroundColor: '#dfffdf',
        zoomType: 'x',
        scrollablePlotArea: {
          minWidth: 500
        }
      },
      title: {
        text: 'Gyakorlatok'
      },
      credits: {
        enabled: false
      },
      xAxis: {
        type: 'datetime',
        dateTimeLabelFormats: {
          day: '%Y %b %e',
          week: '%Y %b %e',
          month: '%Y %b',
        }
      },
      yAxis: [
        {
          type: 'linear',
          title: { text: 'Haladás' },
          labels: { formatter() { return `${this.value}%` } },
        }
      ]
    })
    this.drawGraph()
  }

  private drawGraph() {
    if (!this.chart || this.allEntries.length === 0) {
      return
    }

    const groupedByType = {}
    this.allEntries.reverse().forEach(i => {
      const id = i.type.hu
      const arr = (groupedByType[id] || []) as TrainingEntryItem[]
      arr.push(i)
      groupedByType[id] = arr
    })

    // clear all previous series
    for (let i = 0; i < this.seriesCount; i++) {
      this.chart.removeSeries(0)
    }

    Object.values(groupedByType).map((trainingItems: TrainingEntryItem[]) => {
      const name = trainingItems[0].type.hu
      const data = trainingItems.map(d => ({
        x: d.date.getTime(),
        y: d.progress,
        comment: d.comment
      } as PointOptionsObject))

      return {
        name,
        data,
        tooltip: {
          pointFormatter() {
            const t = this as any
            const progressLine = `Haladás: <strong>${t.y}%</strong>`
            if (t.comment) {
              return `${progressLine}<br/><em>${t.comment}</em>`
            } else {
              return progressLine
            }
          }
        }
      } as SeriesLineOptions
    }).forEach(o => this.chart.addSeries(o, true, true))

    this.seriesCount = Object.keys(groupedByType).length
  }

  toggleSeries(change: MatCheckboxChange) {
    this.showAllSeries = change.checked
    this.chart.ref$.subscribe(c => {
      c.series.forEach(s => this.showAllSeries ? s.show() : s.hide())
    })
  }

}
