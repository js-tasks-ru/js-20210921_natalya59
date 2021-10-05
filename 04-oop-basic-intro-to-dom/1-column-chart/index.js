export default class ColumnChart {
  defaultChart = {
    data: [],
    label: '',
    link: '',
    value: 0,
  };
  element;
  chartHeight = 50;
  skeleton = `<img src="charts-skeleton.svg" alt="skeleton" />`;

  constructor(props) {
    this.props = props;
    Object.assign(this, this.defaultChart, props);
    this.render();
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
  }

  getColumnProps(data) {
    const maxValue = Math.max(...data);
    const scale = 50 / maxValue;

    return data.map(item => {
      return {
        percent: (item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale))
      };
    });
  }

  createColumns(data) {
    const chartColumns = data?.length === 0? this.skeleton : this.getColumnProps(this.data).reduce((result, current) => result + `<div style="--value: ${current.value}" data-tooltip="${current.percent}"></div>`, '');
    return `<div data-element="body" class="column-chart__chart">
              ${chartColumns}
            </div>`
  }

  update(newData) {
    this.createColumns(newData);
  }

  getTemplate() {
    if (!this.props) return `<div data-element="body" class="column-chart_loading">
                              ${this.skeleton}
                            </div>`;

    const chartLink = this.link ? `<a href="${this.link}" class="column-chart__link">View all</a>` : '';

    const chartHeader = this.formatHeading? this.formatHeading(this.value) : this.value;

    return `
    <div class="dashboard__chart">
    <div class="column-chart" style="--chart-height: ${this.chartHeight}">
      <div class="column-chart__title">
        Total ${this.label}
        ${chartLink}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">${chartHeader}</div>
        ${this.createColumns(this.data)}
      </div>
    </div>
  </div>
   `
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.element.remove();
  }
}


