import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';
import fetchJson from './utils/fetch-json.js';

export default class Page {
  element;
  components = {};
  subElements = {};
  from = new Date('2020-04-06');
  to = new Date('2020-05-06');

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.initComponents();
    await this.updateComponents(this.from, this.to);
    this.initEventListeners();
    return this.element;
  }

  initComponents() {
    const from = this.from;
    const to = this.to;

    const rangePicker = new RangePicker({from, to});

    const sortableTable = new SortableTable(header, {
      url: 'api/dashboard/bestsellers',
      range: {from, to},
    });

    const ordersChart = new ColumnChart({
      url: 'api/dashboard/orders',
      range: {from, to},
      label: 'orders',
      link: '#'
    });

    const salesChart = new ColumnChart({
      url: 'api/dashboard/sales',
      range: {from, to},
      label: 'sales',
      formatHeading: data => `$${data}`
    });

    const customersChart = new ColumnChart({
      url: 'api/dashboard/customers',
      range: {from, to},
      label: 'customers',
    });

    this.components = {rangePicker, ordersChart, salesChart, customersChart, sortableTable};
  }

  async updateComponents(from, to) {
    const data = await fetchJson(`${BACKEND_URL}api/dashboard/bestsellers?_start=1&_end=21&from=${from.toISOString()}&to=${to.toISOString()}&_sort=title&_order=asc`);
    const charts = ['customersChart', 'salesChart', 'ordersChart']
    await Promise.all(
      [...Object.entries(this.components).map(([key, component])=> {if (charts.includes(key) ) return component.update(this.from, this.to)}), this.components.sortableTable.update(data)])
    ;
    this.renderComponents();
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

  renderComponents () {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements;
      const { element } = this.components[component];
      root[component].append(element);
    });
  }

  initEventListeners () {
    this.components.rangePicker.element.addEventListener('date-select', event => {
      const { from, to } = event.detail;

      this.updateComponents(from, to);
    });
  }

  getTemplate () {
    return `<div class="dashboard">
      <div class="content__top-panel">
        <h2 class="page-title">Dashboard</h2>
        <div data-element="rangePicker"></div>
      </div>
      <div data-element="chartsRoot" class="dashboard__charts">
        <div data-element="ordersChart" class="dashboard__chart_orders"></div>
        <div data-element="salesChart" class="dashboard__chart_sales"></div>
        <div data-element="customersChart" class="dashboard__chart_customers"></div>
      </div>
      <h3 class="block-title">Best sellers</h3>
      <div data-element="sortableTable">
      </div>
    </div>`;
  }

  remove () {
    this.element.remove();
  }

  destroy () {
    this.remove();

    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
