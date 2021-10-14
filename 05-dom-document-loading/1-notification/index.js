export default class NotificationMessage {
  static activeNotification;
  element;
  toSeconds = (value) => value/1000;

  constructor(message = '', {duration = 2000, type='success'} = {}) {
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

  show(target = document.body) {
    if (NotificationMessage.activeNotification) NotificationMessage.activeNotification.remove();
    target.append(this.element);
    setTimeout(() => {this.remove()}, this.duration);
    NotificationMessage.activeNotification = this.element;
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
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
  }
}
