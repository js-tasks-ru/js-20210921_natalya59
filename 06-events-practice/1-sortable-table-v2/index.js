export default class SortableTable {
  element;
  subElements = {};

  handleClick = (event) => {
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
      const sortedData = this.sortData(id, newOrder);
      const arrow = column.querySelector('.sortable-table__sort-arrow');
      column.dataset.order = newOrder;
      if (!arrow) {
        column.append(this.subElements.arrow);
      }
      this.subElements.body.innerHTML = this.getTableRows(sortedData);
    }
  }

  constructor(headersConfig, {
    data = [],
    sorted = {
      id: headersConfig.find(item => item.sortable).id,
      order: 'asc'
    }
  } = {}) {
    this.headerConfig = headersConfig;
    this.data = Array.isArray(data) ? data : data.data;
    this.sortedId = sorted.id;
    this.sortedOrder = sorted.order;
    this.render();
  }

  render() {
    const wrapper = document.createElement('div');
    const sortedData = this.sortData(this.sortedId, this.sortedOrder);
    wrapper.innerHTML = this.getTable(sortedData);
    const element = wrapper.firstElementChild;
    this.element = element;
    this.subElements = this.getSubElements(element);
    this.initEventListeners();
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.handleClick);
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
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getTableRows(data)}
      </div>`;
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
      <div class="sortable-table">
        ${this.getTableHeader()}
        ${this.getTableBody(data)}
      </div>`;
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
}
