import * as HighChart from 'highcharts';

HighChart.setOptions({
  lang: {
    loading: 'Betöltés...',
    months: ['január', 'február', 'március', 'április', 'május', 'június',
      'július', 'augusztus', 'szeptember', 'október', 'november', 'december'],
    shortMonths: ['jan', 'febr', 'márc', 'ápr', 'máj', 'jún', 'júl', 'aug', 'szept', 'okt', 'nov', 'dec'],
    weekdays: ['vasárnap', 'hétfő', 'kedd', 'szerda', 'csütörtök', 'péntek', 'szombat'],
    rangeSelectorFrom: 'ettől',
    rangeSelectorTo: 'eddig',
    rangeSelectorZoom: 'mutat:',
    downloadPNG: 'Letöltés PNG képként',
    downloadJPEG: 'Letöltés JPEG képként',
    downloadPDF: 'Letöltés PDF dokumentumként',
    downloadSVG: 'Letöltés SVG formátumban',
    resetZoom: 'Visszaállít',
    resetZoomTitle: 'Visszaállít',
    thousandsSep: ' ',
    decimalPoint: ','
  },
  time: {
    timezone: 'Europe/Budapest',
    useUTC: false
  }
});
