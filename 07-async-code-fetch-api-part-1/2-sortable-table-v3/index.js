import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  subElements = {};
  currentPage = 1;
  start = 0;
  itemsForPage = 30;
  loading = false;

  handleClick = async (event) => {
    const column = event.target.closest('[data-sortable="true"]');

    const toggleOrder = order => {
      const orders = {
        asc: 'desc',
        desc: 'asc'
      };
      return orders[order];
    };

    if (column) {
      const { id, order } = column.dataset;
      const newOrder = toggleOrder(order);
      const arrow = column.querySelector('.sortable-table__sort-arrow');
      column.dataset.order = newOrder;
      if (!arrow) {
        column.append(this.subElements.arrow);
      }
      if (this.isSortLocally) {
        this.sortOnClient(id, newOrder);
      } else {
        this.sortOnServer(id, newOrder);
      }
    }
  }

  constructor(headersConfig, {
    url= 'api/rest/products',
    sorted = {
      id: headersConfig.find(item => item.sortable).id,
      order: 'asc'
    },
    isSortLocally = false
  } = {}) {
    this.headerConfig = headersConfig;
    this.isSortLocally = isSortLocally;
    this.sortedId = sorted.id;
    this.sortedOrder = sorted.order;
    this.url = BACKEND_URL + '/' + url;
    this.render();
  }


  async getData (params) {
    const url = new URL(this.url);
    if (params)
      Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
    this.element.classList.add('sortable-table_loading');
    const data = await fetchJson(url);
    this.element.classList.remove('sortable-table_loading');
    return data;
  }

  addRows(data) {
    if (data.length) {
      this.element.classList.remove('sortable-table_empty');
      this.subElements.body.innerHTML = this.subElements.body.firstElementChild + this.getTableRows(data);
    } else {
      this.element.classList.add('sortable-table_empty');
      this.subElements.body = this.subElements.body.outerHTML + `
      <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
        <div>
          <p>No products satisfies your filter criteria</p>
            <button type="button" class="button-primary-outline">Reset all filters</button>
          </div>
        </div>`;
    }
  };

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTable();
    const element = wrapper.firstElementChild;
    this.element = element;
    this.subElements = this.getSubElements(element);
    this.initEventListeners();
    const params = {
      '_start': this.start,
      '_end': this.currentPage * this.itemsForPage,
      '_sort': this.sortedId,
      '_order': this.sortedOrder,
    }
    const sortedData = await this.getData(params);
    this.addRows(sortedData);
  }

  onScroll = async () => {
    const {
      scrollTop,
      scrollHeight,
      clientHeight
    } = document.documentElement;

    if ((scrollTop + clientHeight >= scrollHeight) && !this.loading && !this.isSortLocally) {
      this.start = this.currentPage  - 1;
      const params = {
        '_start': this.start,
        '_end': this.currentPage * this.itemsForPage,
        '_sort': this.sortedId,
        '_order': this.sortedOrder,
      }
      this.loading = true;
      const sortedData = await this.getData(params);
      this.loading = false;
      this.addRows(sortedData);
      this.currentPage++;
    }
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.handleClick);
    window.addEventListener('scroll', this.onScroll);
  }

  getTableHeader() {
    return `<div data-element="header" class="sortable-table__header sortable-table__row">
                ${this.headerConfig.map(item => this.getHeaderRow(item)).join('')}
            </div>`;
  }

  getHeaderRow ({id, title, sortable}) {
    const order = this.sortedId === id ? this.sortedOrder : 'asc';
    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${order}">
        <span>${title}</span>
        ${this.getHeaderSortingArrow(id)}
      </div>
    `;
  }
  getHeaderSortingArrow (id) {
    const isOrderExist = this.sortedId === id ? this.sortedOrder : '';
    return isOrderExist
      ? `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`
      : '';
  }
  getTableBody(data) {
    const body = (data && data.length) ? `${this.getTableRows(data)}` :  '';
    return `
      <div data-element="body" class="sortable-table__body"></div>`;
  }
  getTableRows(data) {
    return data.map(item => {
      return `
        <a href="/products/${item.id}" class="sortable-table__row">
          ${this.getTableRow(item)}
        </a>`;
    }).join('');
  }

  getTableRow(item) {
    const cells = this.headerConfig.map(({id, template}) => {
      return {
        id,
        template
      };
    });
    return cells.map(({id, template}) => {
      return template
        ? template(item[id])
        : `<div class="sortable-table__cell">${item[id]}</div>`;
    }).join('');
  }

  getTable(data) {
    return `
      <div data-element="table" class="sortable-table">
        ${this.getTableHeader()}
        ${this.getTableBody(data)}
       <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
      </div>
      `;
  }

  sortData(field, order) {
    const arr = [...this.data];
    const column = this.headerConfig.find(item => item.id === field);
    const { sortType } = column;
    const directions = {
      asc: 1,
      desc: -1
    };
    const direction = directions[order];
    return arr.sort((a, b) => {
      switch (sortType) {
        case 'number':
          return direction * (a[field] - b[field]);
        case 'string':
          return direction * a[field].localeCompare(b[field], ['ru', 'en']);
        default:
          return direction * (a[field] - b[field]);
      }
    });
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

  removeEventListeners() {
    if (this.subElements.header)
      this.subElements.header.removeEventListener('pointerdown', this.handleClick, {
        bubbles: true
      });
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.removeEventListeners();
    this.remove();
    this.element = null;
    this.subElements = {};
  }

  sortOnClient (id, order) {
    const arr = [...this.data];
    const column = this.headerConfig.find(item => item.id === id);
    const { sortType } = column;
    const directions = {
      asc: 1,
      desc: -1
    };
    const direction = directions[order];
    return arr.sort((a, b) => {
      switch (sortType) {
        case 'number':
          return direction * (a[field] - b[field]);
        case 'string':
          return direction * a[field].localeCompare(b[field], ['ru', 'en']);
        default:
          return direction * (a[field] - b[field]);
      }
    });
  }

  async sortOnServer (id='title', order='asc') {
    const sortedData  = await this.getData({'_order': order, '_sort': id, '_start': this.start, '_end': this.currentPage*this.itemsForPage});
    this.subElements.body.innerHTML = this.getTableRows(sortedData);
  }
}
