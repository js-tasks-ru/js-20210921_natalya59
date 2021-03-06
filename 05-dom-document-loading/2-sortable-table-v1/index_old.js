export default class SortableTable {
  element;

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = Array.isArray(data) ? data : data.data;
    this.render();
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.createTemplate(this.data);
    this.element = wrapper.firstElementChild;
  }

  createTableHeader() {
    const header = this.headerConfig.map(({id, sortable,  sortType, title}) => {
      const arrow = sortable && sortType === 'string' ? `<span data-element="arrow" class="sortable-table__sort-arrow">
                                  <span class="sort-arrow"></span>
                                </span>` : '';
      return `<div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="asc">
                <span>${title}</span>
                ${arrow}
             </div>`;
    });


    return `<div data-element="header" class="sortable-table__header sortable-table__row">
      ${header.join('')} </div>`
  }

  createBody() {
    const rowsData = this.data.map(item => {
      return `
        <a href="/products/${item.id}" class="sortable-table__row">
          ${this.getTableRow(item)}
        </a>`;
    }).join('');
    return ` <div data-element="body" class="sortable-table__body">
      ${rowsData}
      </div>`
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

  createTemplate() {
    const temp = `${this.createTableHeader()}
        ${this.createBody()}`;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = temp;

    return `<div data-element="productsContainer" class="products-list__container">
      <div class="sortable-table">
        ${temp}
      </div>
    </div>`
  }

  sort(field, type='asc') {
    const fieldConfig = this.headerConfig.find(({id}) => id===field);
    const sortType = fieldConfig?.sortType ?? 'string';
    const compareParams = [['ru', 'en'], {sensitivity: 'variant', caseFirst: 'upper'}];
    this.data.sort(function(obj1,obj2) {
      if (sortType === 'number') {
        return type === 'asc'? obj1[field] - obj2[field] : (obj2[field] - obj1[field]);
      }
      return type === 'asc'? obj1[field].localeCompare(obj2[field], ...compareParams): -obj1[field].localeCompare(obj2[field], ...compareParams);
    });
    this.update(this.data);
  }

  update(newData) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.createBody(newData);
    const updatedBody= wrapper.firstElementChild;
    this.element.querySelector('.sortable-table__body').replaceWith(updatedBody);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}

