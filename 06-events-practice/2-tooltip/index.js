class Tooltip {
  static instance;

  element;
  tooltipText = '';

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance
    }
    Tooltip.instance = this;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<div class="tooltip">${this.tooltipText}</div>`;
    this.element = wrapper.firstElementChild;
  }

  initialize () {
    this.initEventListeners();
  }

  render(text) {
    if (this.element)
      this.element.textContent = `${text ?? this.tooltipText}`;
      document.body.append(this.element);
  }

  onPointerMove = event => {
    this.element.style.left = `${Math.round(event.clientX + 50)}px`;
    this.element.style.top = `${Math.round(event.clientY + 10)}px`;
  };

  onPointerOver = (event) => {
    const tooltip = event.target.dataset.tooltip;
    if (tooltip) {
      this.render(tooltip);
      document.addEventListener('pointermove', this.onPointerMove);
    }
  }

  onPointerOut = () => {
    if (this.element) this.remove();
    document.removeEventListener('pointermove', this.onPointerMove);
  }

  initEventListeners () {
    document.body.addEventListener('pointerout', this.onPointerOut);
    document.body.addEventListener('pointerover', this.onPointerOver);
  }

  removeEventListeners () {
    document.body.removeEventListener('pointerout', this.onPointerOut);
    document.body.removeEventListener('pointerover', this.onPointerOver);
    document.removeEventListener('pointermove', this.onPointerMove);
  }

  remove() {
    if (this.element)
      this.element.remove();
  }

  destroy() {
    this.removeEventListeners();
    this.remove();
  }
}

export default Tooltip;
