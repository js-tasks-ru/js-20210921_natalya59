export default class SortableTable {
  element;
  subElements = {};
  titleNodes = [];

  constructor(headersConfig, {
    data = [],
    sorted = {}
  } = {}, isSortLocally = false,) {
    this.headerConfig = headersConfig;
    this.data = Array.isArray(data) ? data : data.data;
    this.sortedId = sorted.id ?? 'sales';
    this.sortedOrder = sorted.order ?? 'desc';
    this.isSortLocally = isSortLocally;

    this.render();
    this.sort();
    this.addEventListeners();
  }

  getTableHeader() {
    return `<div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.headerConfig.map(({id}) => this.getHeaderRow(id)).join('')}
    </div>`;
  }

  getHeaderRow(fieldId) {
    const {title, sortable} = this.headerConfig.find(({id}) => fieldId === id);
    return `
      <div class="sortable-table__cell" data-id="${fieldId}" data-sortable="${sortable}">
        <span>${title}</span>
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
      </div>
    `;
  }

  getTableBody() {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getTableRows(this.data)}
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

  getTable() {
    return `
      <div class="sortable-table">
        ${this.getTableHeader()}
        ${this.getTableBody()}
      </div>`;
  }

  render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTable();

    const element = wrapper.firstElementChild;

    this.element = element;
    this.subElements = this.getSubElements(element);
  }

  sort() {
    const sortedData = this.sortData(this.sortedId, this.sortedOrder);
    const allColumns = this.element.querySelectorAll('.sortable-table__cell[data-id]');
    const currentColumn = this.element.querySelector(`.sortable-table__cell[data-id="${this.sortedId}"]`);

    // NOTE: Remove sorting arrow from other columns
    allColumns.forEach(column => {
      if (column.id !== 'images')
      column.dataset.order = '';
    });

    currentColumn.dataset.order = this.sortedOrder;

    this.subElements.body.innerHTML = this.getTableRows(sortedData);
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

  handleClick = (event) => {
    const columName = event.path[0].innerText;
    const {id} = this.headerConfig.find(({title}) => title === columName);
    if (this.sortedId === id) {
      this.sortedOrder = this.sortedOrder === 'asc'? 'desc' : 'asc';
      this.sort();
    } else {
      this.sortedId = id;
      this.sort();
    }
  }

  addEventListeners() {
    this.titleNodes = this.element.querySelectorAll('.sortable-table__cell[data-sortable=true] > span:first-child');
    this.titleNodes.forEach((node) => {
      node.addEventListener('click', this.handleClick);
    })
  }

  removeEventListeners() {
    this.titleNodes.forEach((node) => {
      node.removeEventListener('click', this.handleClick, {
      bubbles: true});
    })
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
    this.removeEventListeners();
  }
}
