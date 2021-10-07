export default class NotificationMessage {
  element;
  toSeconds = (value) => value/1000;

  constructor(message = '', {duration = 0, type='success'} = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;
    this.render();
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.createTemplate();
    this.element = wrapper.firstElementChild;
  }

  show(target) {
    if (target) {
      target.insertAdjacentElement('afterend', this.element);
      this.element = target;
    } else this.element.replaceWith(this.element);
    setTimeout(() => {this.remove()}, this.duration)
  }

  createTemplate() {
    return `<div class="notification ${this.type}" style="--value:${this.toSeconds(this.duration)}s">
    <div class="timer"></div>
    <div class="inner-wrapper">
      <div class="notification-header">${this.type}</div>
      <div class="notification-body">
        ${this.message}
      </div>
    </div>
  </div>`
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
