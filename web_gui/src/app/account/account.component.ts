import {Component, OnInit} from '@angular/core';
import {Chart} from 'angular-highcharts';
import {ApiService} from '../_helpers/services/api.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {

  walletAddress: string;
  walletData: any;
  miningTabSelected: string;
  charts = {};
  chart: Chart;
  workersList: any[] = [];
  paymentsLimit: number;
  dailyAverage: any;
  dailyAverage24: any;
  weeklyAverage: any;
  monthlyAverage: any;


  static drawChart(chartData, chartColorSeriesRGB): Chart {
    const chartColor = '#0c68cc';
    const chartColorSeries = 'rgb(' + chartColorSeriesRGB + ')';
    let pointStyle = 'background-color: rgba(' + chartColorSeriesRGB + ', 0.55);';
    pointStyle = pointStyle + ' font-size: 12px;';
    pointStyle = pointStyle + ' color: white;';
    pointStyle = pointStyle + ' border-radius: 5px;';
    pointStyle = pointStyle + ' padding: 2px 7px;';
    pointStyle = pointStyle + ' box-shadow: 0 2px 6px rgba(0, 0, 0, 0.16);';
    pointStyle = pointStyle + ' font-weight: 100;';
    const point = '<div style="' + pointStyle + '"><b>{point.y}</b> {point.x:%d %b, %H:%M GMT}</div>';


    return new Chart({
      title: {text: ''},
      credits: {enabled: false},
      exporting: {enabled: false},
      legend: {enabled: false},

      navigator: {
        enabled: true,
        height: 5,
        maskFill: '#64DDE2',
        maskInside: true,
        outlineWidth: 0,
        handles: {
          backgroundColor: '#64DDE2',
          borderColor: '#64DDE2',
          width: 7,
          height: 7,
          symbols: ['doublearrow', 'doublearrow'],
        }
      },

      chart: {
        type: 'line',
        backgroundColor: 'transparent',
        height: 250,
        zoomType: null,
        style: {
          fontFamily: 'Helvetica'
        }
      },

      yAxis: {
        min: 0,
        tickAmount: 3,
        title: {
          text: ''
        },
        gridLineColor: chartColor,
        gridLineWidth: 1,
        tickWidth: 1,
        tickColor: chartColor,
        labels: {
          style: {
            color: '#fff',
            fontSize: '14px',
          },
        }
      },

      xAxis: {
        type: 'datetime',
        gridLineColor: chartColor,
        lineColor: chartColor,
        lineWidth: 1,
        tickWidth: 1,
        tickLength: 10,
        tickColor: chartColor,
        labels: {
          style: {
            color: '#fff',
            fontSize: '14px'
          },
          format: '{value:%d %b}'
        },
        minPadding: 0,
        maxPadding: 0,
        minTickInterval: 60000,
        endOnTick: true,
      },

      tooltip: {
        borderWidth: 0,
        shadow: false,
        backgroundColor: 'transparent',
        crosshairs: true,
        useHTML: true,
        headerFormat: '',
        footerFormat: '',

        xDateFormat: '%b %Y',
        pointFormat: point,
        shared: true,
        padding: 0
      },

      rangeSelector: {
        enabled: true,
        inputEnabled: false,
        allButtonsEnabled: true,
        verticalAlign: 'bottom',
        x: -60,
        height: 45,
        buttonPosition: {
          align: 'center',
          y: 5,
        },
        labelStyle: {
          display: 'none',
        },
        buttons: [{
          type: 'all',
          text: 'All'
        }, {
          type: 'day',
          count: 1,
          text: 'Days'
        }, {
          type: 'hour',
          count: 1,
          text: 'Hours'
        }, {
          type: 'minute',
          count: 10,
          text: '10 min'
        }],
        buttonSpacing: 0,
        buttonTheme: {
          width: 70,
          height: null,
          fill: 'transparent',
          stroke: '#64DDE2',
          'stroke-width': 1,
          r: 0,
          padding: 3,
          style: {
            color: '#64DDE2',
          },
          states: {
            hover: {
              fill: '#64DDE2',
              style: {
                color: '#09284A'
              }
            },
            select: {
              fill: '#64DDE2',
              stroke: '#64DDE2',
              'stroke-width': 1,
              style: {
                color: '#09284A',
                opacity: 1,
                fontWeight: 400,
              }
            },
          }
        },
        selected: 0,
      },

      plotOptions: {
        area: {
          color: chartColorSeries,
          shadow: true,
          states: {
            hover: {
              lineWidthPlus: 0
            },
          },
          fillColor: {
            linearGradient: {
              x1: 0,
              y1: 0,
              x2: 0,
              y2: 1
            },
            stops: [
              [0, 'rgba(' + chartColorSeriesRGB + ', 0.55)'],
              [1, 'rgba(' + chartColorSeriesRGB + ', 0.1)']
            ]
          },
          marker: {
            enabled: true,
            radius: 4,
            states: {
              hover: {
                fillColor: chartColorSeries,
                radiusPlus: 0,
                lineWidthPlus: 2
              },
            }
          },
          lineWidth: 2,
          threshold: null
        },
        series: {
          states: {
            hover: {
              halo: {
                size: 0
              }
            }
          }
        }
      },

      series: [{
        type: 'area',
        data: chartData,
      }]
    });
  }

  constructor(private service: ApiService) {
    this.miningTabSelected = 'total';
    this.paymentsLimit = 10;
    // this.walletAddress = '@mc';

  }

  ngOnInit() {
  }

  getInfoWallet() {
    this.service.getMiner(this.walletAddress).subscribe(data => {
      this.workersList = [];
      this.charts = {};
      this.walletData = data;
      const hashRateChartInfo = data['workers']['hasrate_chart'];
      const workerStatsInfo = data['workers']['worker_stats'];

      const dailyPeriod = Math.round(new Date().getTime() / 1000) - (24 * 3600);
      const weeklyPeriod = Math.round(new Date().getTime() / 1000) - (24 * 7 * 3600);
      const monthlyPeriod = Math.round(new Date().getTime() / 1000) - (24 * 30 * 3600);

      let dailyTotal = 0;
      let dailyLen = 0;
      let weeklyTotal = 0;
      let weeklyLen = 0;
      let monthlyTotal = 0;
      let monthlyLen = 0;

      let dailyTotal24 = 0;
      let dailyLen24 = 0;
      let nameWorker2 = '';

      for (let i = 0; i < hashRateChartInfo.length; i++) {
        if (dailyPeriod <= (hashRateChartInfo[i][0] / 1000)) {
          dailyTotal += parseInt(hashRateChartInfo[i][1][3], 10);
          dailyLen++;
        }
        if (weeklyPeriod <= (hashRateChartInfo[i][0] / 1000)) {
          weeklyTotal += parseInt(hashRateChartInfo[i][1][3], 10);
          weeklyLen++;
        }
        if (monthlyPeriod <= (hashRateChartInfo[i][0] / 1000)) {
          monthlyTotal += parseInt(hashRateChartInfo[i][1][3], 10);
          monthlyLen++;
        }

        for (let y = 0; y < hashRateChartInfo[1][1].length - 2; y++) {
          if (y % 2 === 0) {
            nameWorker2 = hashRateChartInfo[0][1][y].split(':')[1];
          } else {
            if (dailyPeriod <= (hashRateChartInfo[i][0] / 1000)) {
              dailyTotal24 += parseInt(hashRateChartInfo[i][1][1], 10);
              dailyLen24++;
            }
          }
        }
      }
      this.dailyAverage = dailyTotal / dailyLen;
      this.dailyAverage24 = dailyTotal24 / dailyLen24;
      this.weeklyAverage = weeklyTotal / weeklyLen;
      this.monthlyAverage = monthlyTotal / monthlyLen;


      // charts
      hashRateChartInfo.forEach(item => {
        const itemDate = new Date(item[0]).getTime();
        if (!this.charts['total']) {
          this.charts['total'] = [];
        }
        this.charts['total'].push([itemDate, parseFloat(item[1][item[1].length - 1])]);
        let name = '';
        let hashrate = '';
        for (let i = 0; i < item[1].length - 2; i++) {
          if (i % 2 === 0) {
            name = item[1][i].split(':')[1];
          } else {
            hashrate = item[1][i];
            if (!this.charts[name]) {
              this.charts[name] = [];
            }
            this.charts[name].push([itemDate, parseFloat(hashrate)]);
          }
        }
      });

      this.setChart('total');

      let nameWorker = '';
      let hashRateWorker = '';
      let totalWorker, staleWorker, invalidWorker, blocksWorker, staleInterestWorker, invalidInteresWorker;

      for (let i = 0; i < hashRateChartInfo[0][1].length - 2; i++) {
        if (i % 2 === 0) {
          nameWorker = hashRateChartInfo[0][1][i].split(':')[1];
        } else {
          hashRateWorker = hashRateChartInfo[0][1][i];
          totalWorker = workerStatsInfo['total_' + nameWorker];
          staleWorker = workerStatsInfo['stale_' + nameWorker];
          staleInterestWorker = (staleWorker / totalWorker) * 100;
          invalidWorker = workerStatsInfo['invalid_' + nameWorker];
          invalidInteresWorker = (invalidWorker / totalWorker) * 100;
          blocksWorker = workerStatsInfo['blocks_' + nameWorker];
          this.workersList.push(
            {
              name: nameWorker,
              hashrate: hashRateWorker,
              hashrate24: this.dailyAverage24,
              total: totalWorker,
              stale: staleWorker,
              staleInterest: staleInterestWorker.toFixed(1),
              invalidInterest: invalidInteresWorker.toFixed(1),
              invalid: invalidWorker,
              blocks: blocksWorker
            }
          );
        }
      }
    });
  }

  setChart(name) {
    this.miningTabSelected = name;
    this.chart = AccountComponent.drawChart(this.charts[this.miningTabSelected], '100, 221, 226');
  }

}
