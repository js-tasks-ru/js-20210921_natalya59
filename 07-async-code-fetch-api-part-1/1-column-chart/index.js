import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  element;
  subElements = {};
  chartHeight = 50;
  data = {};

  constructor({
                url = '',
                label = '',
                link = '',
                range =  {
                  from: {},
                  to: {}},
                formatHeading = data => data,
                value = '',
              } = {}) {
    this.url =  BACKEND_URL + '/' + url;
    this.range = {from: range.from, to: range.to};
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;
    this.value = formatHeading(value);

    this.render();
    this.update();
  }

  getTotalValue(data) {
    return `${Object.values(data).reduce((sum, current) => current + sum, 0)}`;
  }

  get template() {
    return `
      <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.getLink()}
        </div>
        <div class="column-chart__container">
           <div data-element="header" class="column-chart__header">
             ${this.value}
           </div>
          <div data-element="body" class="column-chart__chart">
            ${this.getColumnBody(this.data)}
          </div>
        </div>
      </div>
    `;
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  getColumnBody(data) {
    const maxValue = Math.max(...Object.values(data));
    const scale = this.chartHeight / maxValue;

    return Object.values(data)
      .map(item => {
        const percent = (item / maxValue * 100).toFixed(0);

        return `<div style="--value: ${Math.floor(item * scale)}" data-tooltip="${percent}%"></div>`;
      })
      .join('');
  }

  getLink() {
    return this.link ? `<a class="column-chart__link" href="${this.link}">View all</a>` : '';
  }

  updateCallback(data) {
    if (Object.values(data).length) {
      this.element.classList.remove('column-chart_loading');
      this.subElements.header.innerText = this.formatHeading(this.getTotalValue(data));
      this.subElements.body.innerHTML = this.getColumnBody(data);
    }
  }

  async update(from={}, to={}) {
    const range = {};
    if (!isNaN(from.valueOf())) range.from  = from.toISOString();
    if (!isNaN(to.valueOf())) range.to = to.toISOString();
    const url = new URL(this.url);
    Object.entries(range).forEach(([key, value]) => {if (value) url.searchParams.append(key, value)});
    const data = await fetchJson(url);
    this.updateCallback(data);
    return data;
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}
