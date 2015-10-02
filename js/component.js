import $ from 'js/utils.js';

export default class Component {
  constructor(template_path) {
    this.template_path = template_path;
    $.get(this.template_path)
      .then((html) => this.template_html = html);
  }

  render() {
    this.el = document.createElement('template');
    this.el.innerHTML = this.template_html;
  }
}
